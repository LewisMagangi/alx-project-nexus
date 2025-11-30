from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .serializers import (
    AccountSerializer,
    EmptySerializer,
    PasswordChangeSerializer,
)


class AccountUpdateView(generics.UpdateAPIView):
    """Update account info (maps to PUT/PATCH /api/account/)"""

    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordChangeView(generics.UpdateAPIView):
    """Change password"""

    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response(
            {"detail": "Password changed"}, status=status.HTTP_200_OK
        )


class AccountDeleteView(generics.DestroyAPIView):
    """Delete account"""

    serializer_class = EmptySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        return Response(
            {"detail": "Account deactivated"}, status=status.HTTP_200_OK
        )
