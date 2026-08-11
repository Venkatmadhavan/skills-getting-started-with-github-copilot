from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

import src.app as app_module


@pytest.fixture
def client():
    app_module.activities = deepcopy(app_module.INITIAL_ACTIVITIES)

    with TestClient(app_module.app) as test_client:
        yield test_client
