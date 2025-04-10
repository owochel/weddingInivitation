
  const URL =
    "https://script.google.com/macros/s/AKfycbx4nIvmHoPreK2A_PyvDJeSyGBfOI7SHVHBOSE0ekmKmtdv5xv4q4AFzSrTxarHtJHP/exec";
  const getLatestDocument = () => {
    fetch(URL, {
      method: "GET",
    })
      .then(async (res) => {
        console.log("Response received:", res);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const responseJson = await res.json();
        const message = responseJson.message;
        let data = message.splice(1); // Extract the comments
        console.log(data);

        const commentBody = document.getElementById("comment");
        commentBody.innerHTML = ""; // Clear previous comments

        if (data.length === 0) {
          // ✅ Show placeholder message & maintain container height
          commentBody.innerHTML = `
            <p class="text-gray-500 italic text-center py-4 w-full">
                Be the first to say your wishes.
            </p>`;
          return;
        }

        // ✅ Reverse the order so newest comments appear first
        data.reverse();

        data.forEach((row) => {
          const timestamp = new Date(row[0]).toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const userName = row[1];
          let userMessage = row[2];
          // ✅ Convert new lines (`\n`) into `<br>` to preserve formatting
          userMessage = userMessage.replace(/\n/g, "<br>");

          // Create main comment container
          const commentDiv = document.createElement("div");
          commentDiv.classList.add("comment");

          // Name and timestamp in the same line
          const nameTimeContainer = document.createElement("div");
          nameTimeContainer.classList.add("header");

          const nameElement = document.createElement("span");
            nameElement.classList.add("name");
          nameElement.textContent = userName;

          const timeElement = document.createElement("span");
          timeElement.classList.add("timestamp");
          timeElement.textContent = timestamp;

          nameTimeContainer.appendChild(nameElement);
          nameTimeContainer.appendChild(timeElement);

          // ✅ Convert new lines (`\n`) into `<br>` and use `innerHTML` instead of `textContent`
          const messageElement = document.createElement("p");
          messageElement.classList.add("message");
          messageElement.innerHTML = userMessage.replace(/\n/g, "<br>"); // ✅ Corrected

          // Append elements
          commentDiv.appendChild(nameTimeContainer);
          commentDiv.appendChild(messageElement);

          // Append main comment to container
          commentBody.appendChild(commentDiv);
        });
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        document.getElementById("responseMessage").textContent =
          "Something went wrong. Check console.";
      });
  };

  // Fetch and display comments when the page loads
  getLatestDocument();

  document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.getElementById("guestMessage");
    const submitButton = document.getElementById("modalSubmitMessage");

    // Initially hide the button
    submitButton.style.display = "none";

    messageInput.addEventListener("input", function () {
      if (messageInput.value.trim() !== "") {
        submitButton.style.display = "block"; // Show the button
      } else {
        submitButton.style.display = "none"; // Hide the button
      }
    });
  });
  document.getElementById("modalSubmitMessage").addEventListener("click", function () {
    const submitButton = document.getElementById("modalSubmitMessage");
    submitButton.disabled = true; // Disable the button immediately
  
    const nameInput = document.getElementById("guestName");
    const messageInput = document.getElementById("guestMessage");
    const responseMessage = document.getElementById("responseMessage");
  
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
  
    if (name === "" || message === "") {
      responseMessage.textContent = "Please fill in both fields.";
      submitButton.disabled = false; // re-enable if validation fails
      return;
    }
  
    fetch(URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message }),
    })
      .then(() => {
        responseMessage.textContent = "Thank you for your message!";
        getLatestDocument();
        nameInput.value = "";
        messageInput.value = "";
        submitButton.style.display = "none";
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        responseMessage.textContent = "Something went wrong. Check console.";
      })
      .finally(() => {
        setTimeout(() => submitButton.disabled = false, 2000); // re-enable after 2s
      });
  });

  
  const updateCommentContainerHeight = () => {
    const commentContainer = document.getElementById("comment-container");
    const totalComments = document.querySelectorAll(".comment").length;

    // Calculate height dynamically based on the number of comments
    let newHeight = 50 + totalComments * 50; // Each comment ~50px
    let maxHeight = window.innerHeight - 300; // Prevents exceeding screen

    // Apply height limits
    commentContainer.style.height = `${Math.min(newHeight, maxHeight)}px`;
  };

  // Run on page load and update when new comments are added
  document.addEventListener("DOMContentLoaded", updateCommentContainerHeight);
  setInterval(updateCommentContainerHeight, 500); // Update periodically

  const loadGuests = async () => {
    try {
      const response = await fetch("guestslist.json");
      let guests = await response.json();
      guests = guests.sort(() => Math.random() - 0.5);

      const guestList = document.getElementById("guestList");
      guestList.innerHTML = ""; // Clear previous content

      const maxGuestsInitially = 3; // ✅ Number of guests to show initially
      let showAll = false; // ✅ State to track whether all guests are shown

      const renderGuests = () => {
        guestList.innerHTML = ""; // Clear and re-render

        const guestsToDisplay = showAll
          ? guests
          : guests.slice(0, maxGuestsInitially);

        guestsToDisplay.forEach((guest) => {
          const guestDiv = document.createElement("div");
          guestDiv.classList.add(
            "person",
            "flex",
            "items-center",
            "gap-4",
            "mb-3",
            "w-full"
          );

          // Image
          const img = document.createElement("img");
          img.src = guest.image;
          img.alt = guest.name;
          img.classList.add("w-10", "h-10", "rounded-full");

          // Guest Info
          const guestInfo = document.createElement("div");
          const name = document.createElement("p");
          name.innerHTML = `<strong>${guest.name}</strong>`;

          const role = document.createElement("p");
          role.textContent = guest.role;
          role.classList.add("text-gray-500", "text-sm");

          guestInfo.appendChild(name);
          guestInfo.appendChild(role);

          // Profile Button
          const profileButton = document.createElement("a");
          profileButton.href = guest.profile_link;
          profileButton.classList.add("view-button");
          profileButton.textContent = "View Profile";

          // Append elements
          guestDiv.appendChild(img);
          guestDiv.appendChild(guestInfo);
          guestDiv.appendChild(profileButton);
          guestList.appendChild(guestDiv);
        });

        // Add "Show More" button if there are more guests
        if (guests.length > maxGuestsInitially) {
          const showMoreButton = document.createElement("button");
          showMoreButton.textContent = showAll ? "Show Less" : "Show More";
          showMoreButton.classList.add(
            "mt-3",
            "text-blue-500",
            "hover:underline",
            "text-sm"
          );
          showMoreButton.addEventListener("click", () => {
            showAll = !showAll;
            renderGuests(); // Re-render with updated state
          });

          guestList.appendChild(showMoreButton);
        }
      };

      // Initial render
      renderGuests();
    } catch (error) {
      console.error("Error loading guests:", error);
    }
  };

  // Load guests when the page loads
  document.addEventListener("DOMContentLoaded", loadGuests);

  document
  .getElementById("rsvpButton")
  .addEventListener("click", function () {
    window.location.href =
      "https://calendar.app.google/s8HZxK6FWjHnq3ZE6";
  });

document
  .getElementById("sayCongrats")
  .addEventListener("click", function () {
    $(".ui.modal").css({ height: "auto" });
  });