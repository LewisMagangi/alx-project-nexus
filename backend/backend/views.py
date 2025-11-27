from django.shortcuts import render


def simple_home(request):
    return render(request, "home.html")
