from django.shortcuts import render


def auth_home(request):
    return render(request, "auth_home.html")
