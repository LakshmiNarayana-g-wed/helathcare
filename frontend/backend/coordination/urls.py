from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CoordinationTaskViewSet, HumanReviewViewSet

router = DefaultRouter()
router.register(r'tasks', CoordinationTaskViewSet, basename='coordination-task')
router.register(r'human-review', HumanReviewViewSet, basename='human-review')

urlpatterns = [
    path('', include(router.urls)),
]
