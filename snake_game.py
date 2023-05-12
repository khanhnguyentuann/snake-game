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
    # Vị trí rắn và mồi
    head = random_snake_position()
    snake = [head, (head[0] - SNAKE_SIZE, head[1]),
                    (head[0] - 2 * SNAKE_SIZE, head[1])]
    snake_direction = (SNAKE_SPEED, 0)
    new_direction = snake_direction
    food = random_food_position(snake)

    # Khởi tạo điểm số
    score = 0
    high_score = get_high_score()

    moved = True

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

        # Cập nhật vị trí rắn
        snake_direction = new_direction
        new_head = (snake[0][0] + snake_direction[0], snake[0][1] + snake_direction[1])

        if (new_head[0] < GAME_AREA[0] or new_head[0] >= GAME_AREA[0] + GAME_AREA[2]
                or new_head[1] < GAME_AREA[1] or new_head [1] >= GAME_AREA[1] + GAME_AREA[3]
                or new_head in snake[1:]):
            save_high_score(high_score)
            game_over(score)

        snake.insert(0, new_head)

        # Kiểm tra ăn mồi
        if new_head == food:
            food = random_food_position(snake)
            score += 1
            if score > high_score:
                high_score = score

        else:
            snake.pop()

        # Vẽ rắn và mồi
        screen.fill(WHITE)
        for s in snake:
            pygame.draw.rect(
                screen, GREEN, (s[0], s[1], SNAKE_SIZE, SNAKE_SIZE))
        pygame.draw.rect(
            screen, RED, (food[0], food[1], SNAKE_SIZE, SNAKE_SIZE))

        draw_border()
        draw_score(score, high_score)  # Hiển thị điểm số

        pygame.display.flip()
        fps.tick(7)
        moved = True


if __name__ == "__main__":
    main()
