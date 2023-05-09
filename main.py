import pygame
import sys
import random
from pygame.locals import *

# Khởi tạo
pygame.init()
fps = pygame.time.Clock()

# Cấu hình
WINDOW_SIZE = (600, 400)
SNAKE_SIZE = 20
SNAKE_SPEED = 10
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLACK = (0, 0, 0)

# Tạo cửa sổ
screen = pygame.display.set_mode(WINDOW_SIZE)
pygame.display.set_caption("Rắn săn mồi")


def game_over():
    font = pygame.font.Font(None, 54)
    text = font.render("Game Over", True, RED)
    screen.blit(text, (WINDOW_SIZE[0] // 2 - 100, WINDOW_SIZE[1] // 2 - 50))
    pygame.display.flip()
    while True:
        for event in pygame.event.get():
            if event.type == QUIT or (event.type == KEYDOWN and event.key == K_q):
                pygame.quit()
                sys.exit()
            elif event.type == KEYDOWN:
                main()


def main():
    # Vị trí rắn và mồi
    snake = [(100, 100), (90, 100), (80, 100)]
    snake_direction = (SNAKE_SPEED, 0)
    food = (random.randint(1, (WINDOW_SIZE[0] - SNAKE_SIZE) // SNAKE_SIZE) * SNAKE_SIZE,
            random.randint(1, (WINDOW_SIZE[1] - SNAKE_SIZE) // SNAKE_SIZE) * SNAKE_SIZE)

    while True:
        for event in pygame.event.get():
            if event.type == QUIT:
                pygame.quit()
                sys.exit()

            # Kiểm soát rắn
            if event.type == KEYDOWN:
                if event.key == K_UP and snake_direction[1] != SNAKE_SPEED:
                    snake_direction = (0, -SNAKE_SPEED)
                elif event.key == K_DOWN and snake_direction[1] != -SNAKE_SPEED:
                    snake_direction = (0, SNAKE_SPEED)
                elif event.key == K_LEFT and snake_direction[0] != SNAKE_SPEED:
                    snake_direction = (-SNAKE_SPEED, 0)
                elif event.key == K_RIGHT and snake_direction[0] != -SNAKE_SPEED:
                    snake_direction = (SNAKE_SPEED, 0)

        # Cập nhật vị trí rắn
        new_head = (snake[0][0] + snake_direction[0],
                    snake[0][1] + snake_direction[1])
        if new_head in snake or new_head[0] < 0 or new_head[0] >= WINDOW_SIZE[0] or new_head[1] < 0 or new_head[1] >= WINDOW_SIZE[1]:
            game_over()

        snake.insert(0, new_head)

        # Kiểm tra ăn mồi
        if new_head == food:
            food = (random.randint(1, (WINDOW_SIZE[0] - SNAKE_SIZE) // SNAKE_SIZE) * SNAKE_SIZE,
                    random.randint(1, (WINDOW_SIZE[1] - SNAKE_SIZE) // SNAKE_SIZE) * SNAKE_SIZE)
        else:
            snake.pop()

        # Vẽ rắn và mồi
        screen.fill(WHITE)
        for s in snake:
            pygame.draw.rect(screen, GREEN, (s[0], s[1], SNAKE_SIZE, SNAKE_SIZE))
        pygame.draw.rect(screen, RED, (food[0], food[1], SNAKE_SIZE, SNAKE_SIZE))

        pygame.display.flip()
        fps.tick(15)

if __name__ == "__main__":
    main()
