// Setup map
const map = L.map('map').setView([52.6225, 1.2414], 15);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Trail color dictionary
const trailColors = {
  "Green Trail": "green",
  "Orange Trail": "orange",
  "Pink Trail": "hotpink",
  "Purple Trail": "purple",
  "Gray Trail": "gray",
  "Blue Trail": "blue",
  "Fair Weather Route": "dodgerblue"
};

// Distance + time dictionary
const trailInfo = {
  "Green Trail": { distance: 1.7 },
  "Orange Trail": { distance: 1.5 },
  "Pink Trail": { distance: 2.3 },
  "Purple Trail": { distance: 2.3 },
  "Gray Trail": { distance: 2.5 },
  "Blue Trail": { distance: 2.0 },
  "Fair Weather Route": { distance: 1.8 }
};

// Load GeoJSON
fetch('uea-trails.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: feature => {
        const name = feature.properties?.name;
        const color = trailColors[name] || "black";
        return { color: color, weight: 4 };
      },
      onEachFeature: function (feature, layer) {
        const name = feature.properties?.name || "Unnamed Trail";
        const trailData = trailInfo[name];
        const distance = trailData?.distance;

        let timeText = "";
        if (distance) {
          const timeInMinutes = Math.round((distance / 5) * 60); // 5 km/h walk
          timeText = `<p><strong>Estimated time:</strong> ~${timeInMinutes} mins</p>`;
        }

        layer.on('click', () => {
  const trailId = name.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9]/g, '');

  document.querySelectorAll(".trail-tab-content").forEach(tab => {
    tab.style.display = 'none';
  });

  document.querySelectorAll(".trail-tab").forEach(btn => {
    btn.classList.remove("active");
  });

  const section = document.getElementById(trailId);
  const button = document.querySelector(`.trail-tab[data-tab="${trailId}"]`);
  if (section) section.style.display = 'block';
  if (button) button.classList.add("active");

  section?.scrollIntoView({ behavior: 'smooth' });
});

      }
    }).addTo(map);
  });

// GPS Tracking Marker
let userMarker = null;

navigator.geolocation.watchPosition(
  (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (!userMarker) {
      userMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          iconSize: [25, 25],
          iconAnchor: [12, 12]
        })
      }).addTo(map);
    } else {
      userMarker.setLatLng([lat, lng]);
    }

     
  },
  (err) => {
    console.error("GPS error:", err);
  },
  {
    enableHighAccuracy: true
  }
);
document.getElementById('toggle-about').addEventListener('click', function () {
  const aboutSection = document.getElementById('about-tab');
  const trailInfo = document.getElementById('trail-info');

  const isVisible = aboutSection.style.display === 'block';

  aboutSection.style.display = isVisible ? 'none' : 'block';
  trailInfo.style.display = isVisible ? 'block' : 'none';
});
// 🔄 TAB SWITCHING FOR TRAIL INFO
const trailTabs = document.querySelectorAll(".trail-tab");
const trailContents = document.querySelectorAll(".trail-tab-content");

trailTabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedTab = btn.getAttribute("data-tab");
    const selectedSection = document.getElementById(selectedTab);
    const isVisible = selectedSection.style.display === "block";

    // Hide all tabs first
    trailContents.forEach((content) => {
      content.style.display = "none";
    });

    // Toggle the selected one
    if (!isVisible) {
      selectedSection.style.display = "block";
    }

    // Optional: toggle active class
    trailTabs.forEach((b) => b.classList.remove("active"));
    if (!isVisible) {
      btn.classList.add("active");
    }
  });
});
const UEA_BROAD_LAT = 52.6221;
const UEA_BROAD_LNG = 1.2411;

const NEAR_LIMIT = 1600;  // 1 mile
const MID_LIMIT = 3200;   // 2 miles

function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lat2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function showTrails() {
  document.querySelectorAll('.trail-line').forEach(line => {
    line.style.display = 'inline';
  });
  document.getElementById('gps-warning')?.classList.add('hidden');
}

function hideTrails() {
  document.querySelectorAll('.trail-line').forEach(line => {
    line.style.display = 'none';
  });
  document.getElementById('gps-warning')?.classList.remove('hidden');
}

function checkLocation() {
  if (!navigator.geolocation) {
    showTrails();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      const dist = distanceInMeters(latitude, longitude, UEA_BROAD_LAT, UEA_BROAD_LNG);

      console.log("Distance from Broad:", dist);

      if (dist <= NEAR_LIMIT) {
        // Close → unlock
        showTrails();
      } else if (dist <= MID_LIMIT) {
        // Middle zone → hide
        hideTrails();
      } else {
        // Too far away → show again
        showTrails();
      }
    },

    // If GPS fails → show everything
    err => {
      console.warn("GPS error:", err);
      showTrails();
    }
  );
}

document.addEventListener("DOMContentLoaded", checkLocation);
