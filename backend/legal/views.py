from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.
class LegalView(APIView):
    def get(self, request, page):
        content = {
            "privacy": "Your privacy policy text...",
            "terms": "Your terms and conditions text...",
        }
        return Response({"page": page, "content": content.get(page, "")})
