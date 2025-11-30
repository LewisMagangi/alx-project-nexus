from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required
def messages_home(request):
    return render(request, "messages_home.html")
