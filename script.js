const cubicPressureFromMag = (mag) => {
  return (0.0138667635 * mag ** 3) - (3.3900755595 * mag ** 2) + (228.2606206263 * mag) - 3232.4239837815;
};

const calibrationMagnitudes = [];
const calibrationPressures = [];
for (let m = 40; m <= 90; m += 1) {
  calibrationMagnitudes.push(m);
  calibrationPressures.push(cubicPressureFromMag(m));
}

const slider = document.getElementById('magSlider');
const magValue = document.getElementById('magValue');
const pressureValue = document.getElementById('pressureValue');
const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

const ctx = document.getElementById('calibrationChart');
const selectedPoint = {
  x: Number(slider.value),
  y: cubicPressureFromMag(Number(slider.value))
};

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: calibrationMagnitudes,
    datasets: [
      {
        label: 'Cubic calibration model',
        data: calibrationPressures,
        borderColor: 'rgba(110, 231, 249, 1)',
        backgroundColor: 'rgba(110, 231, 249, 0.12)',
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.35,
        borderWidth: 3
      },
      {
        label: 'Selected operating point',
        data: [selectedPoint],
        parsing: false,
        showLine: false,
        pointRadius: 6,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgba(244, 114, 182, 1)',
        pointBorderColor: 'rgba(255,255,255,0.9)',
        pointBorderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#eff6ff' }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.datasetIndex === 1) {
              return ` Selected point: ${context.raw.y.toFixed(1)} psi`;
            }
            return ` Pressure: ${context.raw.toFixed(1)} psi`;
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'MAG (mV)', color: '#a4b3ca' },
        ticks: { color: '#a4b3ca' },
        grid: { color: 'rgba(255,255,255,0.08)' }
      },
      y: {
        title: { display: true, text: 'Pressure (psi)', color: '#a4b3ca' },
        ticks: { color: '#a4b3ca' },
        grid: { color: 'rgba(255,255,255,0.08)' }
      }
    }
  }
});

function updateSelectedPoint() {
  const mag = Number(slider.value);
  const pressure = cubicPressureFromMag(mag);
  magValue.textContent = mag.toFixed(1);
  pressureValue.textContent = pressure.toFixed(1);
  chart.data.datasets[1].data = [{ x: mag, y: pressure }];
  chart.update('none');
}

slider.addEventListener('input', updateSelectedPoint);
updateSelectedPoint();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const filters = document.querySelectorAll('.gallery-filter');
const galleryCards = document.querySelectorAll('.gallery-card');

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const filter = button.dataset.filter;

    galleryCards.forEach((card) => {
      const category = card.dataset.category;
      const show = filter === 'all' || category.includes(filter);
      card.classList.toggle('is-hidden', !show);
    });
  });
});
