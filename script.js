document.addEventListener('DOMContentLoaded', () => {
  const cubicPressureFromMag = (mag) => (
    0.0138667635 * (mag ** 3)
    - 3.3900755595 * (mag ** 2)
    + 228.2606206263 * mag
    - 3232.4239837815
  );

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const slider = document.getElementById('magSlider');
  const magValue = document.getElementById('magValue');
  const pressureValue = document.getElementById('pressureValue');
  const chartRoot = document.getElementById('calibrationChart');

  const initCalibrationChart = () => {
    if (!slider || !magValue || !pressureValue || !chartRoot) return;

    const xMin = 40;
    const xMax = 90;
    const magnitudes = [];
    const pressures = [];
    for (let m = xMin; m <= xMax; m += 1) {
      magnitudes.push(m);
      pressures.push(cubicPressureFromMag(m));
    }

    const yMin = Math.min(...pressures);
    const yMax = Math.max(...pressures);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 760 430');
    svg.setAttribute('preserveAspectRatio', 'none');

    chartRoot.innerHTML = '';
    chartRoot.appendChild(svg);

    const W = 760;
    const H = 430;
    const M = { top: 24, right: 24, bottom: 54, left: 72 };
    const plotW = W - M.left - M.right;
    const plotH = H - M.top - M.bottom;

    const xScale = (x) => M.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const yScale = (y) => M.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

    const make = (name, attrs = {}) => {
      const el = document.createElementNS(svgNS, name);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
      return el;
    };

    svg.appendChild(make('rect', {
      x: M.left,
      y: M.top,
      width: plotW,
      height: plotH,
      rx: 18,
      fill: 'rgba(255,255,255,0.02)',
      stroke: 'rgba(255,255,255,0.08)'
    }));

    const gridGroup = make('g');
    svg.appendChild(gridGroup);

    const yTicks = 5;
    for (let i = 0; i <= yTicks; i += 1) {
      const yVal = yMin + ((yMax - yMin) * i / yTicks);
      const y = yScale(yVal);
      gridGroup.appendChild(make('line', {
        x1: M.left,
        y1: y,
        x2: M.left + plotW,
        y2: y,
        stroke: 'rgba(255,255,255,0.10)',
        'stroke-width': 1
      }));

      const label = make('text', {
        x: M.left - 12,
        y: y + 4,
        'text-anchor': 'end',
        fill: '#a4b3ca',
        'font-size': 13
      });
      label.textContent = String(Math.round(yVal));
      svg.appendChild(label);
    }

    [40, 50, 60, 70, 80, 90].forEach((xVal) => {
      const x = xScale(xVal);
      gridGroup.appendChild(make('line', {
        x1: x,
        y1: M.top,
        x2: x,
        y2: M.top + plotH,
        stroke: 'rgba(255,255,255,0.08)',
        'stroke-width': 1
      }));

      const label = make('text', {
        x,
        y: M.top + plotH + 28,
        'text-anchor': 'middle',
        fill: '#a4b3ca',
        'font-size': 13
      });
      label.textContent = String(xVal);
      svg.appendChild(label);
    });

    const xAxisLabel = make('text', {
      x: M.left + plotW / 2,
      y: H - 12,
      'text-anchor': 'middle',
      fill: '#a4b3ca',
      'font-size': 14,
      'font-weight': 600
    });
    xAxisLabel.textContent = 'MAG (mV)';
    svg.appendChild(xAxisLabel);

    const yAxisLabel = make('text', {
      x: 20,
      y: M.top + plotH / 2,
      'text-anchor': 'middle',
      fill: '#a4b3ca',
      'font-size': 14,
      'font-weight': 600,
      transform: `rotate(-90 20 ${M.top + plotH / 2})`
    });
    yAxisLabel.textContent = 'Pressure (psi)';
    svg.appendChild(yAxisLabel);

    let linePath = '';
    magnitudes.forEach((mag, i) => {
      const x = xScale(mag);
      const y = yScale(pressures[i]);
      linePath += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
    });

    const areaPath = `${linePath}L ${xScale(xMax)} ${M.top + plotH} L ${xScale(xMin)} ${M.top + plotH} Z`;

    svg.appendChild(make('path', {
      d: areaPath,
      fill: 'rgba(110, 231, 249, 0.12)'
    }));

    svg.appendChild(make('path', {
      d: linePath,
      fill: 'none',
      stroke: '#6ee7f9',
      'stroke-width': 4,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    }));

    const pointLineX = make('line', {
      stroke: 'rgba(244, 114, 182, 0.35)',
      'stroke-width': 1.5,
      'stroke-dasharray': '6 5'
    });
    const pointLineY = make('line', {
      stroke: 'rgba(244, 114, 182, 0.35)',
      'stroke-width': 1.5,
      'stroke-dasharray': '6 5'
    });
    const pointGlow = make('circle', {
      r: 11,
      fill: 'rgba(244, 114, 182, 0.25)'
    });
    const point = make('circle', {
      r: 6,
      fill: '#f472b6',
      stroke: 'rgba(255,255,255,0.95)',
      'stroke-width': 2
    });

    svg.appendChild(pointLineX);
    svg.appendChild(pointLineY);
    svg.appendChild(pointGlow);
    svg.appendChild(point);

    const updateSelectedPoint = () => {
      const mag = clamp(Number(slider.value), xMin, xMax);
      const pressure = cubicPressureFromMag(mag);
      const x = xScale(mag);
      const y = yScale(pressure);

      magValue.textContent = mag.toFixed(1);
      pressureValue.textContent = pressure.toFixed(1);

      pointGlow.setAttribute('cx', x);
      pointGlow.setAttribute('cy', y);
      point.setAttribute('cx', x);
      point.setAttribute('cy', y);
      pointLineX.setAttribute('x1', x);
      pointLineX.setAttribute('x2', x);
      pointLineX.setAttribute('y1', y);
      pointLineX.setAttribute('y2', M.top + plotH);
      pointLineY.setAttribute('x1', M.left);
      pointLineY.setAttribute('x2', x);
      pointLineY.setAttribute('y1', y);
      pointLineY.setAttribute('y2', y);
    };

    slider.addEventListener('input', updateSelectedPoint, { passive: true });
    updateSelectedPoint();
  };

  initCalibrationChart();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }

  const filters = document.querySelectorAll('.gallery-filter');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      galleryCards.forEach((card) => {
        const category = card.dataset.category || '';
        const show = filter === 'all' || category.includes(filter);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  document.querySelectorAll('video').forEach((video) => {
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'metadata');
    video.addEventListener('error', () => {
      const shell = video.closest('.video-shell');
      if (shell && !shell.querySelector('.video-fallback')) {
        const msg = document.createElement('p');
        msg.className = 'video-fallback';
        msg.textContent = 'Video file not found. Check that the file name and folder match exactly.';
        shell.appendChild(msg);
      }
    });
  });
});
