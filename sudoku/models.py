from django.db import models
from django.contrib.auth.models import User
import random
import secrets


class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @staticmethod
    def generate_code():
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    def __str__(self):
        return f"{self.user.email} - {'Verified' if self.is_verified else 'Pending'}"


class GameResult(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_results')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    time_seconds = models.IntegerField()
    hints_used = models.IntegerField(default=0)
    completed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['time_seconds', 'hints_used']
    
    def __str__(self):
        return f"{self.user.username} - {self.difficulty} - {self.time_seconds}s"


class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"


class SudokuGenerator:
    @staticmethod
    def generate_full_board():
        board = [[0] * 9 for _ in range(9)]
        SudokuGenerator._fill_board(board)
        return board
    
    @staticmethod
    def _fill_board(board):
        for i in range(9):
            for j in range(9):
                if board[i][j] == 0:
                    nums = list(range(1, 10))
                    random.shuffle(nums)
                    for num in nums:
                        if SudokuGenerator._is_valid(board, i, j, num):
                            board[i][j] = num
                            if SudokuGenerator._fill_board(board):
                                return True
                            board[i][j] = 0
                    return False
        return True
    
    @staticmethod
    def _is_valid(board, row, col, num):
        if num in board[row]:
            return False
        if num in [board[i][col] for i in range(9)]:
            return False
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board[i][j] == num:
                    return False
        return True
    
    @staticmethod
    def create_puzzle(difficulty='medium'):
        solution = SudokuGenerator.generate_full_board()
        puzzle = [row[:] for row in solution]
        
        cells_to_remove = {
            'easy': 30,
            'medium': 40,
            'hard': 50,
        }.get(difficulty, 40)
        
        cells = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(cells)
        
        for i, j in cells[:cells_to_remove]:
            puzzle[i][j] = 0
        
        return puzzle, solution
    
    @staticmethod
    def check_solution(puzzle, user_solution):
        for i in range(9):
            if sorted(user_solution[i]) != list(range(1, 10)):
                return False
            if sorted([user_solution[j][i] for j in range(9)]) != list(range(1, 10)):
                return False
        
        for box_row in range(3):
            for box_col in range(3):
                box = []
                for i in range(3):
                    for j in range(3):
                        box.append(user_solution[box_row * 3 + i][box_col * 3 + j])
                if sorted(box) != list(range(1, 10)):
                    return False
        
        return True
