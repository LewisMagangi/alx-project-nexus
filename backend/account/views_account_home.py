from django.shortcuts import render


def account_home(request):
    return render(request, "account_home.html")
