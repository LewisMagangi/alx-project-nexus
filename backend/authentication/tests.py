from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import UserProfile
from .views import hash_token


class PasswordResetTestCase(APITestCase):
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            bio='Test bio',
            avatar_url='test.jpg'
        )

    def test_password_reset_request_success(self):
        """Test successful password reset request"""
        url = reverse('password-reset')
        data = {'email': 'test@example.com'}

        with patch('authentication.views.send_mail') as mock_send_mail:
            response = self.client.post(url, data, format='json')

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('detail', response.data)
            self.assertIn(
                'If the email exists, a verification link will be sent',
                response.data['detail']
            )

            # Check that email was attempted to be sent
            mock_send_mail.assert_called_once()

            # Check that reset token was generated
            self.user_profile.refresh_from_db()
            self.assertIsNotNone(self.user_profile.reset_token)
            self.assertIsNotNone(self.user_profile.reset_token_expires)

    def test_password_reset_request_invalid_email(self):
        """Test password reset request with invalid email"""
        url = reverse('password-reset')
        data = {'email': 'nonexistent@example.com'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
        self.assertIn(
            'If email exists, a verification link will be sent',
            response.data['detail']
        )

    def test_password_reset_verify_email_success(self):
        """Test successful email verification for password reset"""
        # First, generate a reset token
        self.user_profile.reset_token = hash_token('test_token_123')
        self.user_profile.reset_token_expires = (
            timezone.now() + timedelta(hours=1)
        )
        self.user_profile.save()

        url = reverse('password-reset-verify')
        data = {'email': 'test@example.com', 'token': 'test_token_123'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
        self.assertIn('Email verified successfully', response.data['detail'])

        # Check that token is still valid after verification
        self.user_profile.refresh_from_db()
        self.assertIsNotNone(self.user_profile.reset_token)
        self.assertIsNotNone(self.user_profile.reset_token_expires)

    def test_password_reset_verify_email_invalid_token(self):
        """Test email verification with invalid token"""
        url = reverse('password-reset-verify')
        data = {'email': 'test@example.com', 'token': 'invalid_token'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Invalid or expired reset link', response.data['error'])

    def test_password_reset_verify_email_expired_token(self):
        """Test email verification with expired token"""
        # Set expired token
        self.user_profile.reset_token = hash_token('expired_token')
        self.user_profile.reset_token_expires = (
            timezone.now() - timedelta(hours=1)
        )
        self.user_profile.save()

        url = reverse('password-reset-verify')
        data = {'email': 'test@example.com', 'token': 'expired_token'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn(
            'Reset link has expired. Please request a new one.',
            response.data['error']
        )

    def test_password_reset_confirm_success(self):
        """Test successful password reset confirmation"""
        # First, generate a reset token
        self.user_profile.reset_token = hash_token('verified_token')
        self.user_profile.reset_token_expires = (
            timezone.now() + timedelta(hours=1)
        )
        self.user_profile.save()

        # Now try to reset password
        url = reverse('password-reset-confirm')
        data = {
            'email': 'test@example.com',
            'token': 'verified_token',
            'new_password': 'newpassword123',
            'confirm_password': 'newpassword123'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)
        self.assertIn('Password reset successful', response.data['detail'])

        # Check that password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))

    def test_password_reset_confirm_unverified_email(self):
        """Test password reset confirmation without email verification"""
        url = reverse('password-reset-confirm')
        data = {
            'email': 'test@example.com',
            'token': 'some_token',
            'new_password': 'newpassword123',
            'confirm_password': 'newpassword123'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Invalid or expired reset link', response.data['error'])

    def test_password_reset_confirm_password_mismatch(self):
        """Test password reset confirmation with mismatched passwords"""
        # First, generate a reset token
        self.user_profile.reset_token = hash_token('verified_token')
        self.user_profile.reset_token_expires = (
            timezone.now() + timedelta(hours=1)
        )
        self.user_profile.save()

        url = reverse('password-reset-confirm')
        data = {
            'email': 'test@example.com',
            'token': 'verified_token',
            'new_password': 'newpassword123',
            'confirm_password': 'differentpassword'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Passwords do not match', response.data['error'])

    def test_password_reset_confirm_invalid_email(self):
        """Test password reset confirmation with invalid email"""
        url = reverse('password-reset-confirm')
        data = {
            'email': 'nonexistent@example.com',
            'token': 'some_token',
            'new_password': 'newpassword123',
            'confirm_password': 'newpassword123'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Invalid reset link', response.data['error'])
        self.assertIn('error', response.data)
        self.assertIn('Invalid reset link', response.data['error'])

    @patch('authentication.views.send_mail')
    def test_email_template_rendering(self, mock_send_mail):
        """Test that HTML email template is rendered correctly"""
        url = reverse('password-reset')
        data = {'email': 'test@example.com'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that send_mail was called with HTML content
        call_args = mock_send_mail.call_args
        self.assertIn('html_message', call_args.kwargs)
        self.assertIn('subject', call_args.kwargs)

        # Check that HTML message contains expected content
        html_message = call_args.kwargs['html_message']
        self.assertIn('Nexus', html_message)
        self.assertIn('Verify Email & Reset Password', html_message)

    def test_token_expiry_logic(self):
        """Test that tokens expire after the configured time"""
        # Set token with short expiry
        self.user_profile.reset_token = hash_token('short_token')
        self.user_profile.reset_token_expires = (
            timezone.now() + timedelta(minutes=5)
        )
        self.user_profile.save()

        # Token should be valid now
        url = reverse('password-reset-verify')
        data = {'email': 'test@example.com', 'token': 'short_token'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Simulate time passing by setting expiry to past
        self.user_profile.reset_token = hash_token('expired_token')
        self.user_profile.reset_token_expires = (
            timezone.now() - timedelta(minutes=1)
        )
        self.user_profile.save()

        url = reverse('password-reset-verify')
        data = {'email': 'test@example.com', 'token': 'expired_token'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
