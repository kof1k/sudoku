from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django import forms
import json

from .models import GameResult, ChatMessage, SudokuGenerator


class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=False, help_text='Optional - for account recovery')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


def home(request):
    return render(request, 'home.html')


def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = RegistrationForm()
    return render(request, 'registration/register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'registration/login.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('home')


@login_required
def game_view(request):
    difficulty = request.GET.get('difficulty', 'medium')
    puzzle, solution = SudokuGenerator.create_puzzle(difficulty)
    
    request.session['puzzle'] = puzzle
    request.session['solution'] = solution
    request.session['original_puzzle'] = [row[:] for row in puzzle]
    
    return render(request, 'game.html', {
        'puzzle': puzzle,
        'puzzle_json': json.dumps(puzzle),
        'solution': json.dumps(solution),
        'difficulty': difficulty,
    })


@login_required
@require_POST
def submit_game(request):
    data = json.loads(request.body)
    user_solution = data.get('solution')
    time_seconds = data.get('time', 0)
    hints_used = data.get('hints', 0)
    difficulty = data.get('difficulty', 'medium')
    
    solution = request.session.get('solution')
    
    if user_solution == solution:
        GameResult.objects.create(
            user=request.user,
            difficulty=difficulty,
            time_seconds=time_seconds,
            hints_used=hints_used,
            completed=True
        )
        return JsonResponse({'success': True, 'message': 'Congratulations! Puzzle solved!'})
    else:
        return JsonResponse({'success': False, 'message': 'Solution is incorrect. Keep trying!'})


@login_required
def get_hint(request):
    puzzle = request.session.get('puzzle', [])
    solution = request.session.get('solution', [])
    
    empty_cells = []
    for i in range(9):
        for j in range(9):
            if puzzle[i][j] == 0:
                empty_cells.append((i, j))
    
    if empty_cells:
        import random
        row, col = random.choice(empty_cells)
        hint_value = solution[row][col]
        puzzle[row][col] = hint_value
        request.session['puzzle'] = puzzle
        return JsonResponse({'row': row, 'col': col, 'value': hint_value})
    
    return JsonResponse({'error': 'No empty cells'})


def leaderboard_view(request):
    difficulty = request.GET.get('difficulty', 'all')
    
    if difficulty == 'all':
        results = GameResult.objects.filter(completed=True).select_related('user')[:50]
    else:
        results = GameResult.objects.filter(completed=True, difficulty=difficulty).select_related('user')[:50]
    
    return render(request, 'leaderboard.html', {
        'results': results,
        'current_difficulty': difficulty,
    })


@login_required
def chat_view(request):
    messages = ChatMessage.objects.select_related('user').order_by('-created_at')[:50]
    messages = reversed(list(messages))
    return render(request, 'chat.html', {'messages': messages})


@login_required
@require_POST
def send_message(request):
    data = json.loads(request.body)
    message_text = data.get('message', '').strip()
    
    if message_text:
        message = ChatMessage.objects.create(
            user=request.user,
            message=message_text
        )
        return JsonResponse({
            'success': True,
            'message': {
                'id': message.id,
                'user': message.user.username,
                'text': message.message,
                'created_at': message.created_at.strftime('%H:%M')
            }
        })
    return JsonResponse({'success': False, 'error': 'Empty message'})


@login_required
def get_messages(request):
    last_id = request.GET.get('last_id', 0)
    messages = ChatMessage.objects.filter(id__gt=last_id).select_related('user').order_by('created_at')[:50]
    
    return JsonResponse({
        'messages': [
            {
                'id': m.id,
                'user': m.user.username,
                'text': m.message,
                'created_at': m.created_at.strftime('%H:%M')
            }
            for m in messages
        ]
    })
