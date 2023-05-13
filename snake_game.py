import pygame
import sys
import random
import time
import pickle
from pygame.locals import *

# Khởi tạo
pygame.init()
fps = pygame.time.Clock()

# Cấu hình
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
special_food = None
special_food_start_time = None
food_eaten = 0
SPECIAL_FOOD_SCORE = 5
SPECIAL_FOOD_DURATION = 6
SPECIAL_FOOD_COLOR = (0, 0, 255)  # Màu sắc của mồi đặc biệt

# Tạo cửa sổ
screen = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption("Rắn săn mồi")

paused = False
pause_image = pygame.transform.scale(
    pygame.image.load('pause.png'), (BUTTON_SIZE, BUTTON_SIZE))
play_image = pygame.transform.scale(
    pygame.image.load('play.png'), (BUTTON_SIZE, BUTTON_SIZE))
button_image = pause_image
button_rect = pygame.Rect(140, 70, BUTTON_SIZE, BUTTON_SIZE)


def draw_border():
    pygame.draw.rect(screen, BLACK, pygame.Rect(*GAME_AREA), BORDER_WIDTH)


def random_position(snake=None):
    while True:
        position = (
            random.randint(GAME_AREA[0] // GRID_SIZE + 1, (GAME_AREA[0] +
                           GAME_AREA[2]) // GRID_SIZE - 2) * GRID_SIZE,
            random.randint(GAME_AREA[1] // GRID_SIZE + 1, (GAME_AREA[1] +
                           GAME_AREA[3]) // GRID_SIZE - 2) * GRID_SIZE
        )

        if snake and position not in snake:
            return position
        elif not snake:
            return position


def draw_text(text, font_name, font_size, color, center):
    font = pygame.font.Font(font_name, font_size)
    text_render = font.render(text, True, color)
    text_rect = text_render.get_rect()
    text_rect.center = center
    screen.blit(text_render, text_rect)


def draw_score(score, high_score, play_time, special_food_time_left):
    font1 = pygame.font.SysFont('Arial', 36)
    text1 = font1.render(f"Score: {score}", True, BLACK)
    text1_rect = text1.get_rect()
    text1_rect.topleft = (10, 10)
    screen.blit(text1, text1_rect)

    if score > high_score:  # Cập nhật điểm cao nhất nếu điểm vượt qua điểm cao nhất hiện tại
        high_score = score

    font2 = pygame.font.SysFont('Arial', 36, bold=True)
    text2 = font2.render(f"High Score: {high_score}", True, BLACK)
    text2_rect = text2.get_rect()
    text2_rect.topright = (WINDOW_SIZE[0] - 10, 10)
    screen.blit(text2, text2_rect)

    font3 = pygame.font.SysFont('Arial', 36)
    text3 = font3.render(f"Time: {play_time} s", True, BLACK)
    text3_rect = text3.get_rect()
    text3_rect.topleft = (350, 10)
    screen.blit(text3, text3_rect)

    if special_food_time_left > 0:
        font4 = pygame.font.SysFont('Arial', 36)
        text4 = font4.render(f"Special food: {int(special_food_time_left)} s", True, SPECIAL_FOOD_COLOR)  # sử dụng hàm int() tại đây
        text4_rect = text4.get_rect()
        text4_rect.topleft = (350, 50)
        screen.blit(text4, text4_rect)


def game_over(score):
    draw_text("Game Over!", None, 54, RED,
              (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2))
    draw_text(f"Your Score: {score}", None, 36, BLACK,
              (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2 + 60))
    draw_text("Press 'R' to play again or 'Q' to quit.", None, 24,
              BLACK, (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2 + 100))
    pygame.display.flip()
    while True:
        for event in pygame.event.get():
            if event.type == QUIT or (event.type == KEYDOWN and event.key == K_q):
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN and event.key == K_r:
                main()

def draw_paused():
    font = pygame.font.Font(None, 54)
    text = font.render("Game Paused", True, RED)
    text_rect = text.get_rect()
    text_rect.center = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2)
    screen.blit(text, text_rect)


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
    global button_image, paused, special_food, special_food_start_time, food_eaten
    start_time = time.time()
    head = random_position()
    snake = [head, (head[0] - SNAKE_SIZE, head[1]),
             (head[0] - 2 * SNAKE_SIZE, head[1])]
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
            if event.type == KEYDOWN and moved:
                if event.key == K_UP and snake_direction[1] != SNAKE_SPEED:
                    new_direction = (0, -SNAKE_SPEED)
                elif event.key == K_DOWN and snake_direction[1] != -SNAKE_SPEED:
                    new_direction = (0, SNAKE_SPEED)
                elif event.key == K_LEFT and snake_direction[0] != SNAKE_SPEED:
                    new_direction = (-SNAKE_SPEED, 0)
                elif event.key == K_RIGHT and snake_direction[0] != -SNAKE_SPEED:
                    new_direction = (SNAKE_SPEED, 0)
                moved = False

            if event.type == KEYDOWN and event.key == K_p or (event.type == MOUSEBUTTONDOWN and event.button == 1 and button_rect.collidepoint(event.pos)):
                paused = not paused
                button_image = play_image if paused else pause_image
            screen.fill((255, 255, 255))

        screen.blit(button_image, button_rect)

        if not paused:
            snake_direction = new_direction
            head = (head[0] + snake_direction[0], head[1] + snake_direction[1])
            snake.insert(0, head)
            moved = True

            if (head[0] < GAME_AREA[0] or head[0] >= GAME_AREA[0] + GAME_AREA[2] or
                head[1] < GAME_AREA[1] or head[1] >= GAME_AREA[1] + GAME_AREA[3] or
                    head in snake[1:]):
                update_high_score(score)
                game_over(score)

            # Check if the snake eats the food
            if head == food:
                score += 1
                update_high_score(score)
                food = random_position(snake)
                
                # After eating 9 foods, spawn a special food
                if score % 12 == 0:
                    special_food = random_position(snake)
                    special_food_start_time = time.time()
            else:
                snake.pop()

            # Check if the snake eats the special food
            if special_food and head == special_food:
                score += 3  # The special food gives 5 points
                special_food = None  # Remove the special food after it's eaten
            elif special_food and time.time() - special_food_start_time >= 6:  # The special food lasts for 6 seconds
                special_food = None  # Remove the special food after 6 seconds

        # Update the play time
        play_time = int(time.time() - start_time)
        if special_food:
            special_food_time_left = max(0, SPECIAL_FOOD_DURATION - (time.time() - special_food_start_time))
        else:
            special_food_time_left = 0

        screen.fill(WHITE)
        draw_border()
        for segment in snake:
            pygame.draw.rect(screen, GREEN, pygame.Rect(*segment, SNAKE_SIZE, SNAKE_SIZE))
        pygame.draw.rect(screen, RED, pygame.Rect(*food, SNAKE_SIZE, SNAKE_SIZE))

        # Draw the special food if it exists
        if special_food:
            pygame.draw.rect(screen, BLUE, pygame.Rect(*special_food, SNAKE_SIZE, SNAKE_SIZE))

        draw_score(score, high_score, play_time, special_food_time_left)

        if paused:
            screen.blit(play_image, button_rect)
            draw_paused()
        else:
            screen.blit(pause_image, button_rect)

        pygame.display.flip()
        fps.tick(7)

if __name__ == "__main__":
    main()

        