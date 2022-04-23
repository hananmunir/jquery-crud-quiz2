// Declaring Variables
let departureDate, totalDays;
const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEVELOPMENT_URL = "http://localhost:8800/api/posts";
const DEPLOYED_URL = "https://assign2-express-backend.herokuapp.com/api/posts";
// Event Binding
$(document).ready(function () {
  // Load Posts
  loadPosts();

  // Delete Post
  $(".trip-cards").on("click", ".delete-btn", handleDelete);
  // Create Post
  $(".add-form").submit(addPost);

  // Update Post
  $(".trip-cards").on("click", ".edit-btn", handleUpdate);
  $(".update-form").submit(updatePost);
  //$("#update-btn").click(updatePost);
});

// Loads Posts
function loadPosts() {
  // Ajax Get Request
  $.ajax({
    url: DEPLOYED_URL,
    method: "GET",
    dataType: "json",
    error: function (response) {
      $(".trip-cards").append(
        `<div class="alert alert-danger mt-5">There Was Some Error</div>`
      );
    },
    success: function (response) {
      console.log(response);
      const tripCards = $(".trip-cards");
      tripCards.empty();
      // get months
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "April",
        "May",
        "June",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Loop through responses
      for (let i = 0; i < response.length; i++) {
        var post = response[i];

        // Format Dates
        let date = new Date(post.departureDate).getUTCDate();
        let monthIndex = new Date(post.departureDate).getUTCMonth();
        post.description.length > 180
          ? (post.description = post.description.substring(0, 180) + "...")
          : post.description;

        // Display Responses
        tripCards.append(`<div class="col-12 col-md-6 col-lg-4 col-mid-offset-3 p-3 mt-5" >
          <div class="trip-card" data-id = "${post._id}" >
            <div class="trip-date">${date}th ${months[monthIndex]}</div>
            <div class="dropdown my-dropdown" >
              <button
                class="btn my-menu"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li><a 
                class="dropdown-item edit-btn" 
                
                href="#"   
                data-bs-toggle="modal"
                data-bs-target="#updateModal">
                Edit
                </a></li>
                <li><a class="dropdown-item delete-btn" href="#">Delete</a></li>
              </ul>
            </div>
            
            <div>
              <img class="trip-img" src="${DEPLOYED_URL}/images/${post.image}
" />
            </div>
            <div class="trip-text">
              <div class="trip-info">
                <div class="trip-destination">
                  <i class="fa-solid fa-location-arrow tag-icon"></i>
                  <span class="trip-destination-tag">${post.destination}</span>
                </div>
                <div class="trip-duration">
                  <i class="fa-solid fa-calendar tag-icon"></i>
                  <span class="trip-duration-tag">${post.duration} days ${
          post.duration + 1
        }  nights</span>
                </div>
              </div>
              <div class="trip-desc">
                <span class="trip-title"> ${post.title}</span>
                <span class="trip-details"
                  >${post.description}</span
                >
              </div>
              <a href="" class="trip-more-info">READ MORE</a>
            </div>
          </div>
        </div>`);
      }
    },
  });
}

// update post
function updatePost(evt) {
  //if form is not valid
  if (!$(".update-form")[0].checkValidity()) return;

  var fd = new FormData();
  var files = $("#updateFormFile")[0].files;
  var id = $("#updateId").val();

  // Check file selected or not
  if (files.length > 0) {
    fd.append("image", files[0]);
  }
  fd.append("title", $(".updateTitle").val());
  fd.append("destination", $(".updateDestination").val());
  fd.append("cost", $(".updateCost").val());
  fd.append("description", $(".updateDescription").val());
  fd.append("departureDate", departureDate);
  fd.append("duration", totalDays);
  evt.preventDefault();
  $.ajax({
    url: DEPLOYED_URL + "/" + id,
    method: "PATCH",
    data: fd,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log(response);
      clearValues();
      $("#updateModal").modal("hide");
      loadPosts();
    },
  });
}

// creates post
function addPost(evt) {
  if (!$(".add-form")[0].checkValidity()) return;

  var fd = new FormData();
  fd.append("image", $(".image")[0].files[0]);
  fd.append("title", $(".title").val());
  fd.append("destination", $(".destination").val());
  fd.append("cost", $(".cost").val());
  fd.append("desc", $(".description").val());
  fd.append("departureDate", departureDate);
  fd.append("duration", totalDays);
  evt.preventDefault();
  $.ajax({
    url: DEPLOYED_URL,
    method: "POST",
    data: fd,
    contentType: false,
    processData: false,
    success: function (response) {
      console.log(response);
      clearValues();
      $("#addModal").modal("hide");
      loadPosts();
    },
  });
}

// poupulate update form
function handleUpdate() {
  var btn = $(this);
  var parentDiv = btn.closest(".trip-card");
  let id = parentDiv.attr("data-id");
  $("#updateId").val(id);

  $.ajax({
    url: DEPLOYED_URL + "/" + id,
    method: "GET",
    success: function (response) {
      console.log("response Object Is", response);
      $(".updateTitle").val(response.title);
      $(".updateDestination").val(response.destination);
      $(".updateCost").val(response.cost);
      $(".updateDescription").val(response.description);
      $('input[name="updateDaterange"]').daterangepicker(
        {
          opens: "left",
          startDate: new Date(response.departureDate),
          endDate: setEndDate(response.departureDate, response.duration),
          minDate: new Date(),
          maxSpan: {
            days: 365,
          },
        },
        function (start, end, label) {
          departureDate = start.format("YYYY-MM-DD");
          totalDays = dateDiffInDays(
            new Date(departureDate),
            new Date(end.format("YYYY-MM-DD"))
          );
        }
      );
    },
  });
}

// delete post
function handleDelete() {
  var btn = $(this);
  var parentDiv = btn.closest(".trip-card");
  let id = parentDiv.attr("data-id");

  $.ajax({
    url: DEPLOYED_URL + "/" + id,
    method: "DELETE",
    success: function () {
      loadPosts();
    },
  });
}

//Clears Form Data
function clearValues() {
  $(".title").val("");
  $(".destination").val("");
  $(".cost").val("");
  $(".description").val("");
  $("#daterange").val("");
}

// Gets Difference between two date objects
function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

// Display Calender
$(function () {
  $('input[name="daterange"]').daterangepicker(
    {
      autoUpdateInput: false,
      locale: {
        cancelLabel: "Clear",
      },
      opens: "left",
      minDate: new Date(),
      maxSpan: {
        days: 365,
      },
    },
    function (start, end, label) {
      departureDate = start.format("YYYY-MM-DD");
      totalDays = dateDiffInDays(
        new Date(departureDate),
        new Date(end.format("YYYY-MM-DD"))
      );
      console.log(departureDate, totalDays);
    }
  );
  $('input[name="daterange"]').on(
    "apply.daterangepicker",
    function (ev, picker) {
      $(this).val(
        picker.startDate.format("MM/DD/YYYY") +
          " - " +
          picker.endDate.format("MM/DD/YYYY")
      );
    }
  );

  $('input[name="daterange"]').on(
    "cancel.daterangepicker",
    function (ev, picker) {
      $(this).val("");
    }
  );
});

// handles date formating
function setEndDate(date, duration) {
  let result = new Date(date);
  result.setDate(result.getDate() + duration);

  return result;
}

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
