import pygame
import sys
import random
import time
import pickle
from pygame.locals import *

# Constants
WINDOW_SIZE = (800, 600)
GRID_SIZE = 20
GRID_WIDTH = WINDOW_SIZE[0] // GRID_SIZE
GRID_HEIGHT = WINDOW_SIZE[1] // GRID_SIZE
SNAKE_SIZE = GRID_SIZE
SNAKE_SPEED = GRID_SIZE
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLACK = (0, 0, 0)
BLUE = (0, 0, 255)
BORDER_WIDTH = 2
BUTTON_SIZE = GRID_SIZE
GAME_WIDTH = (WINDOW_SIZE[0] // GRID_SIZE) * 2 // 3 * GRID_SIZE
GAME_HEIGHT = (WINDOW_SIZE[1] // GRID_SIZE) * 2 // 3 * GRID_SIZE
X_OFFSET = (WINDOW_SIZE[0] - GAME_WIDTH) // 2
Y_OFFSET = (WINDOW_SIZE[1] - GAME_HEIGHT) // 2
GAME_AREA = (X_OFFSET, Y_OFFSET, GAME_WIDTH, GAME_HEIGHT)
SPECIAL_FOOD_SCORE = 5
SPECIAL_FOOD_DURATION = 6
SPECIAL_FOOD_COLOR = (0, 0, 255)
MESSAGE_DURATION = 2

# Initialize pygame
pygame.init()
fps = pygame.time.Clock()
screen = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption("Rắn săn mồi")

# Load images
images = {
    "pause": pygame.transform.scale(pygame.image.load('pause.png'), (BUTTON_SIZE, BUTTON_SIZE)),
    "play": pygame.transform.scale(pygame.image.load('play.png'), (BUTTON_SIZE, BUTTON_SIZE))
}

# Game state variables
paused = False
button_image = images["pause"]
button_rect = pygame.Rect(140, 70, BUTTON_SIZE, BUTTON_SIZE)
message = None
message_start_time = None
special_food = None
special_food_start_time = None
food_eaten = 0
current_level = 1
obstacles = []

def draw_border():
    pygame.draw.rect(screen, BLACK, pygame.Rect(*GAME_AREA), BORDER_WIDTH)


def random_position(snake=None, avoid=None):
    if avoid is None:
        avoid = set()
    while True:
        x = random.randrange(GAME_AREA[0] // GRID_SIZE + 1, (GAME_AREA[0] + GAME_AREA[2]) // GRID_SIZE - 2) * GRID_SIZE
        y = random.randrange(GAME_AREA[1] // GRID_SIZE + 1, (GAME_AREA[1] + GAME_AREA[3]) // GRID_SIZE - 2) * GRID_SIZE
        position = (x, y)
        if snake is None or (position not in snake and position not in avoid):
            return position
        

def draw_text(text, font, size, color, center):
    text_render = font.render(text, True, color)
    text_rect = text_render.get_rect(center=center)
    screen.blit(text_render, text_rect)

def draw_score(score, high_score, play_time, special_food_time_left):
    draw_text(f"Score: {score}", font1, 36, BLACK, (70, 30))
    high_score_text = f"High Score: {high_score}"
    if score > high_score:
        high_score = score
        save_high_score(high_score)
    draw_text(high_score_text, font2, 36, BLACK, (WINDOW_SIZE[0] - 130, 30))
    draw_text(f"Time: {play_time} s", font3, 36, BLACK, (370, 30))
    if special_food_time_left > 0:
        draw_text(f"Special food: {int(special_food_time_left)} s", font4, 36, SPECIAL_FOOD_COLOR, (300, 550))

def draw_level(level):
    draw_text(f"Level: {level}", font, 36, BLACK, (220, 30))


def draw_obstacles():
    for obstacle in obstacles:
        pygame.draw.rect(screen, BLACK, pygame.Rect(*obstacle, SNAKE_SIZE, SNAKE_SIZE))


def next_level(level):
    global current_level, obstacles, message, message_start_time, snake
    current_level = level
    if level == 2:
        obstacles = [
            (GRID_SIZE * 15, GRID_SIZE * 5),
            (GRID_SIZE * 15, GRID_SIZE * 6),
            (GRID_SIZE * 15, GRID_SIZE * 7),
            (GRID_SIZE * 15, GRID_SIZE * 8),
            (GRID_SIZE * 15, GRID_SIZE * 9),
            (GRID_SIZE * 15, GRID_SIZE * 10),
            (GRID_SIZE * 15, GRID_SIZE * 11),
            (GRID_SIZE * 15, GRID_SIZE * 12),
            (GRID_SIZE * 15, GRID_SIZE * 13),
            (GRID_SIZE * 24, GRID_SIZE * 14),
            (GRID_SIZE * 24, GRID_SIZE * 15),
            (GRID_SIZE * 24, GRID_SIZE * 16),
            (GRID_SIZE * 24, GRID_SIZE * 17),
            (GRID_SIZE * 24, GRID_SIZE * 18),
            (GRID_SIZE * 24, GRID_SIZE * 19),
            (GRID_SIZE * 24, GRID_SIZE * 20),
            (GRID_SIZE * 24, GRID_SIZE * 21),
            (GRID_SIZE * 24, GRID_SIZE * 22),
            (GRID_SIZE * 24, GRID_SIZE * 23),
            (GRID_SIZE * 24, GRID_SIZE * 24)
        ]
        head = random_position(avoid=obstacles)
        snake = [head, (head[0] - SNAKE_SIZE, head[1]), (head[0] - 2 * SNAKE_SIZE, head[1])]
    message = f"Moving to Level {level}!"
    message_start_time = time.time()

    draw_text(message, font, 54, RED, (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2))
    pygame.display.flip()
    pygame.time.delay(2000)

def game_over(score):
    draw_text("Game Over!", font, 54, RED, (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2))
    draw_text(f"Your Score: {score}", font, 36, BLACK, (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2 + 60))
    draw_text("Press 'R' to play again or 'Q' to quit.", font, 24, BLACK, (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2 + 100))
    pygame.display.flip()
    while True:
        for event in pygame.event.get():
            if event.type == QUIT or (event.type == KEYDOWN and event.key == K_q):
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN and event.key == K_r:
                main()

def draw_paused():
    draw_text("Game Paused", font, 54, RED, (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2))

def get_high_score():
    try:
        with open('high_score.dat', 'rb') as file:
            return pickle.load(file)
    except FileNotFoundError:
        return 0

def save_high_score(high_score):
    with open('high_score.dat', 'wb') as file:
        pickle.dump(high_score, file)

def update_high_score(score):
    high_score = get_high_score()
    if score > high_score:
        save_high_score(score)

def main():
    global button_image, paused, special_food, special_food_start_time, food_eaten, current_level, message, message_start_time
    start_time = time.time()
    head = random_position()
    snake = [head, (head[0] - SNAKE_SIZE, head[1]), (head[0] - 2 * SNAKE_SIZE, head[1])]
    snake_direction = (SNAKE_SPEED, 0)
    new_direction = snake_direction
    food = random_position(snake)
    score = 0
    high_score = get_high_score()
    moved = True

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()
            if event.type == KEYDOWN:
                if moved:
                    direction_map = {
                        K_UP: (0, -SNAKE_SPEED),
                        K_DOWN: (0, SNAKE_SPEED),
                        K_LEFT: (-SNAKE_SPEED, 0),
                        K_RIGHT: (SNAKE_SPEED, 0)
                    }
                    new_direction = direction_map.get(event.key, snake_direction)
                    moved = False
            if event.type == KEYDOWN and event.key == K_p or (event.type == MOUSEBUTTONDOWN and event.button == 1 and button_rect.collidepoint(event.pos)):
                paused = not paused
                button_image = images["play" if paused else "pause"]
            screen.fill(WHITE)
        
        screen.blit(button_image, button_rect)
        
        if paused:
            screen.blit(images["play"], button_rect)
            draw_paused()
            pygame.display.flip()
            continue

        snake_direction = new_direction
        head = (head[0] + snake_direction[0], head[1] + snake_direction[1])
        snake.insert(0, head)
        moved = True

        if not (GAME_AREA[0] <= head[0] < GAME_AREA[0] + GAME_AREA[2] and
                GAME_AREA[1] <= head[1] < GAME_AREA[1] + GAME_AREA[3]) or head in snake[1:]:
            update_high_score(score)
            game_over(score)
            pygame.display.flip()
            continue

        if head == food:
            score += 1
            update_high_score(score)
            food = random_position(snake)
            if score % 12 == 0:
                special_food = random_position(snake)
                special_food_start_time = time.time()
        else:
            snake.pop()

        if score >= 15 and current_level <= score // 15:
            next_level(current_level + 1)
            head = random_position(avoid=obstacles)
            snake = [head, (head[0] - SNAKE_SIZE, head[1]), (head[0] - 2 * SNAKE_SIZE, head[1])]
            food = random_position(snake)

        if current_level > 1:
            for obstacle in obstacles:
                if head == obstacle:
                    update_high_score(score)
                    game_over(score)
                    pygame.display.flip()
                    continue

        if special_food and head == special_food:
            score += 3
            special_food = None
        elif special_food and time.time() - special_food_start_time >= SPECIAL_FOOD_DURATION:
            special_food = None

        play_time = int(time.time() - start_time)
        if special_food:
            special_food_time_left = max(0, SPECIAL_FOOD_DURATION - (time.time() - special_food_start_time))
        else:
            special_food_time_left = 0

        screen.fill(WHITE)
        draw_border()
        pygame.draw.rect(screen, GREEN, pygame.Rect(*head, SNAKE_SIZE, SNAKE_SIZE))
        for segment in snake[1:]:
            pygame.draw.rect(screen, GREEN, pygame.Rect(*segment, SNAKE_SIZE, SNAKE_SIZE))
        pygame.draw.rect(screen, RED, pygame.Rect(*food, SNAKE_SIZE, SNAKE_SIZE))
        if special_food:
            pygame.draw.rect(screen, BLUE, pygame.Rect(*special_food, SNAKE_SIZE, SNAKE_SIZE))
        if current_level > 1:
            draw_obstacles()
        draw_score(score, high_score, play_time, special_food_time_left)
        draw_level(current_level)
        screen.blit(images["pause"], button_rect)
        pygame.display.flip()
        fps.tick(7)
####
if __name__ == "__main__":
    font1 = pygame.font.SysFont('Arial', 36)
    font2 = pygame.font.SysFont('Arial', 36, bold=True)
    font3 = pygame.font.SysFont('Arial', 36)
    font4 = pygame.font.SysFont('Arial', 36)
    font = pygame.font.SysFont('Arial', 36)
    main()##
####