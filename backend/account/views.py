from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.
class AccountUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        user.username = request.data.get("username", user.username)
        user.email = request.data.get("email", user.email)
        user.save()
        return Response({"message": "Updated successfully"})


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.check_password(request.data["old_password"]):
            return Response({"error": "Incorrect password"}, status=400)
        request.user.set_password(request.data["new_password"])
        request.user.save()
        return Response({"message": "Password updated"})


# Account deletion/deactivation view
class AccountDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        # Option 1: Deactivate (recommended for audit)
        user.is_active = False
        user.save()
        return Response({"message": "Account deactivated"}, status=200)

    def post(self, request):
        # Option 2: Hard delete (uncomment if you want permanent deletion)
        # user = request.user
        # user.delete()
        # return Response({"message": "Account deleted"}, status=200)
        return Response(
            {"error": "Use DELETE method to deactivate account."}, status=405
        )
