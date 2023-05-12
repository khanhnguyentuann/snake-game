import pygame
import sys
import random
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
# Define border width and game area
BORDER_WIDTH = 2

# Thu nhỏ kích thước của khu vực chơi thành 2/3 cửa sổ và chia hết cho grid size
GAME_WIDTH = (WINDOW_SIZE[0] // GRID_SIZE) * 2 // 3 * GRID_SIZE
GAME_HEIGHT = (WINDOW_SIZE[1] // GRID_SIZE) * 2 // 3 * GRID_SIZE

# Đặt khu vực chơi ở giữa cửa sổ
X_OFFSET = (WINDOW_SIZE[0] - GAME_WIDTH) // 2
Y_OFFSET = (WINDOW_SIZE[1] - GAME_HEIGHT) // 2

GAME_AREA = (X_OFFSET, Y_OFFSET, GAME_WIDTH, GAME_HEIGHT)


# Tạo cửa sổ
screen = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption("Rắn săn mồi")


paused = False
# Định nghĩa kích thước của nút
BUTTON_SIZE = GRID_SIZE

# Tải và thay đổi kích thước hình ảnh
pause_image = pygame.image.load('pause.png')
pause_image = pygame.transform.scale(pause_image, (BUTTON_SIZE, BUTTON_SIZE))

play_image = pygame.image.load('play.png')
play_image = pygame.transform.scale(play_image, (BUTTON_SIZE, BUTTON_SIZE))

# Khởi tạo nút và gán hình ảnh ban đầu
button_image = pause_image
button_rect = pygame.Rect(50, 50, BUTTON_SIZE, BUTTON_SIZE)


def draw_border():
    pygame.draw.rect(screen, BLACK, pygame.Rect(*GAME_AREA), BORDER_WIDTH)


def random_food_position(snake):
    while True:
        position = (
            random.randint(GAME_AREA[0] // GRID_SIZE + 1, (GAME_AREA[0] +
                           GAME_AREA[2]) // GRID_SIZE - 2) * GRID_SIZE,
            random.randint(GAME_AREA[1] // GRID_SIZE + 1, (GAME_AREA[1] +
                           GAME_AREA[3]) // GRID_SIZE - 2) * GRID_SIZE
        )

        if position not in snake:
            return position


def random_snake_position():
    return (
        random.randint(GAME_AREA[0] // GRID_SIZE + 3, (GAME_AREA[0] +
                       GAME_AREA[2]) // GRID_SIZE - 4) * GRID_SIZE,
        random.randint(GAME_AREA[1] // GRID_SIZE + 3, (GAME_AREA[1] +
                       GAME_AREA[3]) // GRID_SIZE - 4) * GRID_SIZE
    )

def draw_paused():
    font = pygame.font.Font(None, 54)
    text = font.render("Game Paused", True, RED)
    text_rect = text.get_rect()
    text_rect.center = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2)
    screen.blit(text, text_rect)


def draw_score(score, high_score):
    font1 = pygame.font.SysFont('Arial', 36)
    text1 = font1.render(f"Score: {score}", True, BLACK)
    text1_rect = text1.get_rect()
    text1_rect.topleft = (10, 10)
    screen.blit(text1, text1_rect)

    font2 = pygame.font.SysFont('Arial', 36, bold=True)
    text2 = font2.render(f"High Score: {high_score}", True, BLACK)
    text2_rect = text2.get_rect()
    text2_rect.topright = (WINDOW_SIZE[0] - 10, 10)
    screen.blit(text2, text2_rect)


def game_over(score):
    font1 = pygame.font.Font(None, 54)
    text1 = font1.render("Game Over!", True, RED)
    text1_rect = text1.get_rect()
    text1_rect.center = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2)
    screen.blit(text1, text1_rect)

    font2 = pygame.font.Font(None, 36)
    text2 = font2.render(f"Your Score: {score}", True, BLACK)
    text2_rect = text2.get_rect()
    text2_rect.center = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2 + 60)
    screen.blit(text2, text2_rect)

    font3 = pygame.font.Font(None, 24)
    text3 = font3.render(
        "Press 'R' to play again or 'Q' to quit.", True, BLACK)
    text3_rect = text3.get_rect()
    text3_rect.center = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] // 2 + 100)
    screen.blit(text3, text3_rect)

    pygame.display.flip()

    while True:
        for event in pygame.event.get():
            if event.type == QUIT or (event.type == KEYDOWN and event.key == K_q):
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN and event.key == K_r:
                main()


def get_high_score():
    try:
        with open('high_score.dat', 'rb') as file:
            high_score = pickle.load(file)
    except FileNotFoundError:
        high_score = 0
    return high_score


def save_high_score(high_score):
    with open('high_score.dat', 'wb') as file:
        pickle.dump(high_score, file)


def main():
    global button_image
    head = random_snake_position()
    snake = [head, (head[0] - SNAKE_SIZE, head[1]),
                    (head[0] - 2 * SNAKE_SIZE, head[1])]
    snake_direction = (SNAKE_SPEED, 0)
    new_direction = snake_direction
    food = random_food_position(snake)
    score = 0
    high_score = get_high_score()

    moved = True
    global paused

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()

            # Kiểm soát rắn
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

            if event.type == KEYDOWN and event.key == K_p:
                paused = not paused
                button_image = play_image if paused else pause_image

            if event.type == MOUSEBUTTONDOWN and event.button == 1:
                if button_rect.collidepoint(event.pos):
                    paused = not paused
                    button_image = play_image if paused else pause_image
            screen.fill((255, 255, 255))

        screen.blit(button_image, button_rect)
        
        if not paused:
            # Cập nhật hướng đi
            snake_direction = new_direction

            # Di chuyển rắn
            head = (head[0] + snake_direction[0], head[1] + snake_direction[1])
            snake.insert(0, head)
            moved = True

            # Kiểm tra va chạm
            if (head[0] < GAME_AREA[0] or head[0] >= GAME_AREA[0] + GAME_AREA[2] or
                head[1] < GAME_AREA[1] or head[1] >= GAME_AREA[1] + GAME_AREA[3] or
                head in snake[1:]):
                if score > high_score:
                    save_high_score(score)
                game_over(score)

            # Kiểm tra ăn mồi
            if head == food:
                score += 1
                food = random_food_position(snake)
            else:
                snake.pop()

        # Vẽ màn hình
        screen.fill(WHITE)
        draw_border()

        for segment in snake:
            pygame.draw.rect(screen, GREEN, pygame.Rect(*segment, SNAKE_SIZE, SNAKE_SIZE))

        pygame.draw.rect(screen, RED, pygame.Rect(*food, SNAKE_SIZE, SNAKE_SIZE))

        draw_score(score, high_score)

        if paused:
            screen.blit(play_image, button_rect)
            draw_paused()
        else:
            screen.blit(pause_image, button_rect)

        pygame.display.flip()

        # Thời gian chờ
        fps.tick(7)


if __name__ == "__main__":
    main()
