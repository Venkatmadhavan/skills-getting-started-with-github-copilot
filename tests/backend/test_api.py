def test_get_activities_returns_activity_catalog(client):
    response = client.get("/activities")

    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert data["Chess Club"]["schedule"] == "Fridays, 3:30 PM - 5:00 PM"
    assert "michael@mergington.edu" in data["Chess Club"]["participants"]


def test_signup_for_activity_success_and_duplicate(client):
    email = "newstudent@mergington.edu"

    response = client.post(f"/activities/Chess Club/signup?email={email}")

    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for Chess Club"

    updated_activity = client.get("/activities").json()["Chess Club"]
    assert email in updated_activity["participants"]

    duplicate_response = client.post(f"/activities/Chess Club/signup?email={email}")
    assert duplicate_response.status_code == 400
    assert duplicate_response.json()["detail"] == "Student is already signed up for this activity"


def test_unregister_participant_and_missing_participant(client):
    response = client.delete("/activities/Chess Club/participants/michael@mergington.edu")

    assert response.status_code == 200
    assert response.json()["message"] == "Removed michael@mergington.edu from Chess Club"

    updated_activity = client.get("/activities").json()["Chess Club"]
    assert "michael@mergington.edu" not in updated_activity["participants"]

    missing_response = client.delete("/activities/Chess Club/participants/missing@mergington.edu")
    assert missing_response.status_code == 404
    assert missing_response.json()["detail"] == "Participant not found"


def test_unknown_activity_returns_not_found(client):
    response = client.post("/activities/Unknown Club/signup?email=test@mergington.edu")

    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"
