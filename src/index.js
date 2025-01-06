let addToy = false;

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector("#new-toy-btn");
  const toyFormContainer = document.querySelector(".container");
  const toyForm = document.querySelector(".add-toy-form");
  const toyCollection = document.getElementById("toy-collection");

  // Toggle form visibility
  addBtn.addEventListener("click", () => {
    addToy = !addToy;
    toyFormContainer.style.display = addToy ? "block" : "none";
  });

  // Fetch and display toys
  fetch("http://localhost:3000/toys")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch toys");
      return response.json();
    })
    .then((toys) => {
      toys.forEach(renderToy);
    })
    .catch((error) => {
      console.error("Error fetching toys:", error);
      alert("Unable to load toys. Please try again later.");
    });

  // Render a toy card
  function renderToy(toy) {
    const toyCard = document.createElement("div");
    toyCard.className = "card";

    toyCard.innerHTML = `
      <h2>${toy.name}</h2>
      <img src="${toy.image}" class="toy-avatar" alt="${toy.name}" />
      <p>${toy.likes} Likes</p>
      <button class="like-btn" id="${toy.id}">Like ❤️</button>
      <button class="delete-btn" id="delete-${toy.id}">Delete 🗑️</button>
    `;

    const likeBtn = toyCard.querySelector(".like-btn");
    likeBtn.addEventListener("click", () => handleLike(toy, toyCard));

    const deleteBtn = toyCard.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => handleDelete(toy.id, toyCard));

    toyCollection.appendChild(toyCard);
  }

  // Handle form submission to add a new toy
  toyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = toyForm.name.value.trim();
    const image = toyForm.image.value.trim();

    if (!name || !image.startsWith("http")) {
      alert("Please provide a valid toy name and image URL.");
      return;
    }

    const newToy = {
      name,
      image,
      likes: 0,
    };

    fetch("http://localhost:3000/toys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(newToy),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add toy");
        return response.json();
      })
      .then((toy) => {
        renderToy(toy);
        toyForm.reset();
        toyFormContainer.style.display = "none";
        addToy = false;
      })
      .catch((error) => {
        console.error("Error adding toy:", error);
        alert("Unable to add toy. Please try again.");
      });
  });

  // Handle like button click
  function handleLike(toy, toyCard) {
    const newLikes = toy.likes + 1;

    fetch(`http://localhost:3000/toys/${toy.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ likes: newLikes }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update likes");
        return response.json();
      })
      .then((updatedToy) => {
        toy.likes = updatedToy.likes; // Update local data
        toyCard.querySelector("p").textContent = `${updatedToy.likes} Likes`;
      })
      .catch((error) => {
        console.error("Error updating likes:", error);
        alert("Unable to update likes. Please try again.");
      });
  }

  // Handle delete button click
  function handleDelete(toyId, toyCard) {
    if (confirm("Are you sure you want to delete this toy?")) {
      fetch(`http://localhost:3000/toys/${toyId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to delete toy");
          toyCard.remove(); // Remove toy card from DOM
        })
        .catch((error) => {
          console.error("Error deleting toy:", error);
          alert("Unable to delete toy. Please try again.");
        });
    }
  }
});
``