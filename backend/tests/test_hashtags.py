import pytest


@pytest.mark.django_db
def test_create_hashtag():
    from hashtags.models import Hashtag

    h = Hashtag.objects.create(tag="testtag")
    assert h.tag == "testtag"
