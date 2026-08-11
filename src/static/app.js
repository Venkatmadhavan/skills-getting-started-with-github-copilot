document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participantNames = Array.isArray(details.participants) ? details.participants : [];
        const spotsLeft = details.max_participants - participantNames.length;
        const participantItems = participantNames.length
          ? participantNames.map((participant) => `
              <li class="participant-item">
                <span class="participant-name">${participant}</span>
                <button
                  class="participant-delete"
                  type="button"
                  data-activity="${name}"
                  data-email="${participant}"
                  aria-label="Remove ${participant} from ${name}"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </li>`)
          : ['<li class="participant-item empty-state">No participants yet — be the first to sign up.</li>'];

        activityCard.innerHTML = `
          <div class="activity-card-header">
            <h4>${name}</h4>
            <span class="availability-pill">${spotsLeft} spots left</span>
          </div>
          <p class="activity-description">${details.description}</p>
          <p class="activity-meta"><strong>Schedule:</strong> ${details.schedule}</p>
          <div class="participants-section">
            <div class="participants-title-row">
              <p class="participants-label"><strong>Participants</strong></p>
              <span class="participants-count">${participantNames.length} signed up</span>
            </div>
            <ul class="participants-list">
              ${participantItems.join("")}
            </ul>
          </div>
        `;

        const deleteButtons = activityCard.querySelectorAll(".participant-delete");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", async () => {
            const activityName = button.dataset.activity;
            const email = button.dataset.email;

            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(email)}`,
                {
                  method: "DELETE",
                }
              );

              const result = await response.json();

              if (response.ok) {
                showMessage(result.message, "success");
                await fetchActivities();
              } else {
                showMessage(result.detail || "Unable to remove participant.", "error");
              }
            } catch (error) {
              showMessage("Failed to remove participant. Please try again.", "error");
              console.error("Error removing participant:", error);
            }
          });
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
