from fastapi.testclient import TestClient

from src.app import app


client = TestClient(app)


def test_unregister_participant_from_activity():
    activity_name = "Chess Club"
    email = "michael@mergington.edu"

    response = client.delete(f"/activities/{activity_name}/participants/{email}")

    assert response.status_code == 200
    assert response.json()["message"] == f"Removed {email} from {activity_name}"

    updated_activity = client.get("/activities").json()[activity_name]
    assert email not in updated_activity["participants"]

    # restore state for future tests
    client.post(f"/activities/{activity_name}/signup?email={email}")
