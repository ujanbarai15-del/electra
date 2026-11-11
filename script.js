/**
 * ============================================================================
 * ELECTRA PHYSICS ENGINE v1.0
 * Engineered by: Ujan Barai | Dept. of Electrical Engineering, KGEC
 * Module: Real-Time Coulomb Electrostatic Field & Lorentz Vortex Simulator
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Telemetry DOM readouts
  const efieldReadout = document.getElementById('readout-efield');
  const velocityReadout = document.getElementById('readout-velocity');
  const pulseBtn = document.getElementById('pulse-burst-btn');
  const modeButtons = document.querySelectorAll('.mode-btn');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Bioluminescent particle color palette
  const PALETTE = [
    '#ffb703', // Solar Gold
    '#ff2a85', // Electric Coral
    '#00f5d4', // Emerald Plasma
    '#3a86ff', // High-Voltage Azure
    '#b5179e'  // Botanical Magenta
  ];

  // Physics State
  let fieldMode = 'attract'; // 'attract' | 'repel' | 'vortex'
  const pointer = {
    x: width / 2,
    y: height / 2,
    active: false,
    shockwave: 0
  };

  // Resize handler keeps canvas crisp on any laptop or mobile screen
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Mouse & Mobile Touch Listeners
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.touches[0].clientX - rect.left;
      pointer.y = e.touches[0].clientY - rect.top;
      pointer.active = true;
    }
  }, { passive: true });

  // Trigger an electromagnetic wave burst on click or button press
  function triggerEMP() {
    pointer.shockwave = 18;
    if (efieldReadout) {
      efieldReadout.textContent = '984.6 kV/m (PEAK)';
    }
  }

  canvas.addEventListener('click', triggerEMP);
  if (pulseBtn) {
    pulseBtn.addEventListener('click', triggerEMP);
  }

  // Mode Switcher Buttons (Dipole Attraction, Repulsion, Lorentz Vortex)
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      fieldMode = btn.getAttribute('data-mode');
    });
  });

  // Charged Particle Class
  class ChargedParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.6;
      this.vy = (Math.random() - 0.5) * 1.6;
      this.radius = Math.random() * 2.4 + 1.2;
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.charge = Math.random() * 0.8 + 0.4;
    }

    update() {
      const dx = pointer.x - this.x;
      const dy = pointer.y - this.y;
      const distSq = dx * dx + dy * dy + 900; // Softening factor prevents infinite acceleration
      const dist = Math.sqrt(distSq);

      // Apply Coulomb / Lorentz forces within 380px radius
      if (dist < 380) {
        const force = (1600 * this.charge) / distSq;
        const ux = dx / dist;
        const uy = dy / dist;

        if (fieldMode === 'attract') {
          this.vx += ux * force;
          this.vy += uy * force;
        } else if (fieldMode === 'repel') {
          this.vx -= ux * force * 1.4;
          this.vy -= uy * force * 1.4;
        } else if (fieldMode === 'vortex') {
          // Perpendicular Lorentz magnetic spin (F = qv x B)
          this.vx += (-uy * force * 1.5) + (ux * force * 0.25);
          this.vy += (ux * force * 1.5) + (uy * force * 0.25);
        }

        // Apply EMP shockwave burst if triggered
        if (pointer.shockwave > 0) {
          this.vx -= ux * pointer.shockwave * 0.45;
          this.vy -= uy * pointer.shockwave * 0.45;
        }
      }

      // Natural damping (viscous drag) and position integration
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around screen boundaries seamlessly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Instantiate 110 glowing plasma particles
  const PARTICLE_COUNT = window.innerWidth < 768 ? 65 : 110;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new ChargedParticle());

  let frameCount = 0;

  // Main 60 FPS Render Loop
  function animate() {
    // Semi-transparent clear creates smooth glowing motion trails
    ctx.fillStyle = 'rgba(6, 7, 12, 0.22)';
    ctx.fillRect(0, 0, width, height);

    let totalSpeed = 0;

    // Update and draw particles + electrostatic filament lines
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      totalSpeed += Math.hypot(p1.vx, p1.vy);

      // Draw glowing filament bridges between nearby charges
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 105) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          const alpha = (1 - dist / 105) * 0.28;
          ctx.strokeStyle = `rgba(0, 245, 212, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Decay shockwave smoothly
    if (pointer.shockwave > 0) {
      pointer.shockwave *= 0.88;
      if (pointer.shockwave < 0.2) pointer.shockwave = 0;
    }

    // Update live engineering telemetry readouts every 12 frames
    frameCount++;
    if (frameCount % 12 === 0 && efieldReadout && velocityReadout) {
      const avgSpeed = totalSpeed / particles.length;
      const simulatedEField = (115 + avgSpeed * 42).toFixed(1);
      const simulatedDrift = (1.85 + avgSpeed * 0.65).toFixed(2);
      efieldReadout.textContent = `${simulatedEField} kV/m`;
      velocityReadout.textContent = `${simulatedDrift} × 10⁶ m/s`;
    }

    requestAnimationFrame(animate);
  }

  animate();
});
/**
 * ============================================================================
 * ELECTRA ENGINE — STEP 3 MODULES
 * Module 01: 50 Hz Synchronous Power Grid & PID Auto-Stabilizer
 * Module 02: Dual-Channel Cardiac ECG (P-Q-R-S-T) & Neural EEG Synthesizer
 * Engineered by: Ujan Barai | Dept. of Electrical Engineering, KGEC
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------------------------------
     MODULE 01: 50 HZ CITY POWER GRID SIMULATOR
     -------------------------------------------------------------------------- */
  const sliderSolar = document.getElementById('slider-solar');
  const sliderWind = document.getElementById('slider-wind');
  const sliderHydro = document.getElementById('slider-hydro');

  const valSolar = document.getElementById('val-solar');
  const valWind = document.getElementById('val-wind');
  const valHydro = document.getElementById('val-hydro');

  const totalGenEl = document.getElementById('grid-total-gen');
  const targetLoadEl = document.getElementById('grid-target-load');
  const liveFreqEl = document.getElementById('grid-live-freq');
  const statusPill = document.getElementById('grid-status-pill');
  const cityStage = document.getElementById('city-skyline-stage');
  const cityCaption = document.getElementById('city-status-caption');
  const pidBtn = document.getElementById('pid-stabilize-btn');
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  const gridCanvas = document.getElementById('grid-wave-canvas');

  let cityDemand = 450;
  let currentFreq = 50.0;
  let gridPhase = 0;

  function updateGridTelemetry() {
    if (!sliderSolar) return;
    const solar = parseInt(sliderSolar.value, 10);
    const wind = parseInt(sliderWind.value, 10);
    const hydro = parseInt(sliderHydro.value, 10);
    const totalGen = solar + wind + hydro;

    valSolar.textContent = `${solar} MW`;
    valWind.textContent = `${wind} MW`;
    valHydro.textContent = `${hydro} MW`;
    totalGenEl.textContent = `${totalGen} MW`;
    targetLoadEl.textContent = `${cityDemand} MW`;

    // Swing Equation Frequency Deviation: f = 50 + ((P_gen - P_load) / P_load) * 2.5
    const mismatchRatio = (totalGen - cityDemand) / cityDemand;
    currentFreq = 50.0 + mismatchRatio * 2.5;
    const clampedFreq = Math.max(47.5, Math.min(52.5, currentFreq));
    liveFreqEl.textContent = `${clampedFreq.toFixed(2)} Hz`;

    const diff = totalGen - cityDemand;

    cityStage.classList.remove('grid-balanced', 'grid-under', 'grid-over');
    statusPill.classList.remove('status-optimal', 'status-warning', 'status-danger');

    if (Math.abs(diff) <= 25) {
      cityStage.classList.add('grid-balanced');
      statusPill.classList.add('status-optimal');
      statusPill.textContent = `SYNCHRONIZED • ${clampedFreq.toFixed(2)} Hz`;
      liveFreqEl.className = 'metric-num text-cyan';
      cityCaption.textContent = '⚡ Grid Locked near 50.00 Hz — All Substations & Skyline Towers Illuminated';
    } else if (diff < -25) {
      cityStage.classList.add('grid-under');
      statusPill.classList.add('status-warning');
      statusPill.textContent = `UNDER-FREQUENCY • ${clampedFreq.toFixed(2)} Hz`;
      liveFreqEl.className = 'metric-num text-gold';
      cityCaption.textContent = `⚠️ Generation Deficit (${diff} MW) — Brownout Load Shedding Active! Boost Sliders.`;
    } else {
      cityStage.classList.add('grid-over');
      statusPill.classList.add('status-danger');
      statusPill.textContent = `OVER-VOLTAGE SURGE • ${clampedFreq.toFixed(2)} Hz`;
      liveFreqEl.className = 'metric-num text-coral';
      cityCaption.textContent = `🚨 Excess Power (+${diff} MW) — Transformer Over-Frequency Surge! Reduce Sliders.`;
    }
  }

  [sliderSolar, sliderWind, sliderHydro].forEach((s) => {
    if (s) s.addEventListener('input', updateGridTelemetry);
  });

  scenarioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      scenarioBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      cityDemand = parseInt(btn.getAttribute('data-demand'), 10);
      updateGridTelemetry();
    });
  });

  // PID Auto-Stabilizer Smooth Animation
  if (pidBtn) {
    pidBtn.addEventListener('click', () => {
      const targetEach = Math.round(cityDemand / 3 / 5) * 5;
      const remainder = cityDemand - targetEach * 2;
      sliderSolar.value = targetEach;
      sliderWind.value = targetEach;
      sliderHydro.value = remainder;
      updateGridTelemetry();
    });
  }

  // Real-Time 3-Phase AC Oscilloscope Renderer
  if (gridCanvas) {
    const gCtx = gridCanvas.getContext('2d');
    function renderGridWave() {
      const w = gridCanvas.width;
      const h = gridCanvas.height;
      gCtx.fillStyle = 'rgba(4, 5, 10, 0.35)';
      gCtx.fillRect(0, 0, w, h);

      // Center reference line
      gCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      gCtx.beginPath();
      gCtx.moveTo(0, h / 2);
      gCtx.lineTo(w, h / 2);
      gCtx.stroke();

      const freqFactor = (currentFreq - 47.0) / 3.0;
      gridPhase += 0.055 * freqFactor;

      // Draw 3-Phase AC Waves (120 degree phase shift = 2*PI/3)
      const phases = [
        { offset: 0, color: '#00f5d4', width: 2.6 },
        { offset: (2 * Math.PI) / 3, color: '#ffb703', width: 1.5 },
        { offset: (4 * Math.PI) / 3, color: '#ff2a85', width: 1.5 }
      ];

      phases.forEach((p) => {
        gCtx.beginPath();
        for (let x = 0; x < w; x++) {
          const angle = (x / w) * Math.PI * 4 * (currentFreq / 50) + gridPhase + p.offset;
          const y = h / 2 + Math.sin(angle) * (h * 0.34);
          if (x === 0) gCtx.moveTo(x, y);
          else gCtx.lineTo(x, y);
        }
        gCtx.strokeStyle = p.color;
        gCtx.lineWidth = p.width;
        gCtx.shadowBlur = 10;
        gCtx.shadowColor = p.color;
        gCtx.stroke();
        gCtx.shadowBlur = 0;
      });

      requestAnimationFrame(renderGridWave);
    }
    updateGridTelemetry();
    renderGridWave();
  }

  /* --------------------------------------------------------------------------
     MODULE 02: BIO-ELECTRIC HUMAN (ECG P-Q-R-S-T & NEURAL EEG MONITOR)
     -------------------------------------------------------------------------- */
  const bioCanvas = document.getElementById('bio-canvas');
  const bpmSlider = document.getElementById('bio-bpm-slider');
  const bpmReadout = document.getElementById('bio-bpm-readout');
  const sliderLabel = document.getElementById('bio-slider-label');
  const waveReadout = document.getElementById('bio-wave-readout');
  const explanationBox = document.getElementById('bio-state-explanation');
  const stateBtns = document.querySelectorAll('.bio-state-btn');
  const synapseBtn = document.getElementById('fire-synapse-btn');

  let heartBpm = 64;
  let eegMode = 'alpha';
  let actionSpike = 0;
  let bioTime = 0;

  // Mathematical P-Q-R-S-T Cardiac Waveform Generator (Sum of Gaussian pulses)
  function computeECGVoltage(phase) {
    const pWave = 0.18 * Math.exp(-Math.pow((phase - 0.22) / 0.045, 2));
    const qWave = -0.22 * Math.exp(-Math.pow((phase - 0.39) / 0.018, 2));
    const rWave = 1.15 * Math.exp(-Math.pow((phase - 0.43) / 0.02, 2));
    const sWave = -0.32 * Math.exp(-Math.pow((phase - 0.47) / 0.02, 2));
    const tWave = 0.28 * Math.exp(-Math.pow((phase - 0.68) / 0.065, 2));
    return pWave + qWave + rWave + sWave + tWave;
  }

  stateBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      stateBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      heartBpm = parseInt(btn.getAttribute('data-bpm'), 10);
      eegMode = btn.getAttribute('data-eeg');
      if (bpmSlider) bpmSlider.value = heartBpm;
      if (bpmReadout) bpmReadout.textContent = `${heartBpm} BPM`;
      if (sliderLabel) sliderLabel.textContent = `${heartBpm} BPM`;
      if (waveReadout) waveReadout.textContent = btn.getAttribute('data-label');
      if (explanationBox) explanationBox.textContent = btn.getAttribute('data-desc');
    });
  });

  if (bpmSlider) {
    bpmSlider.addEventListener('input', () => {
      heartBpm = parseInt(bpmSlider.value, 10);
      if (bpmReadout) bpmReadout.textContent = `${heartBpm} BPM`;
      if (sliderLabel) sliderLabel.textContent = `${heartBpm} BPM`;
    });
  }

  if (synapseBtn) {
    synapseBtn.addEventListener('click', () => {
      actionSpike = 1.0;
    });
  }

  if (bioCanvas) {
    const bCtx = bioCanvas.getContext('2d');
    const ecgBuffer = new Array(bioCanvas.width).fill(0);
    const eegBuffer = new Array(bioCanvas.width).fill(0);

    function renderBioMonitor() {
      const w = bioCanvas.width;
      const h = bioCanvas.height;

      bCtx.fillStyle = '#04050a';
      bCtx.fillRect(0, 0, w, h);

      // Subtle medical oscilloscope grid lines
      bCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      bCtx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 40) {
        bCtx.beginPath();
        bCtx.moveTo(gx, 0);
        bCtx.lineTo(gx, h);
        bCtx.stroke();
      }
      for (let gy = 0; gy < h; gy += 40) {
        bCtx.beginPath();
        bCtx.moveTo(0, gy);
        bCtx.lineTo(w, gy);
        bCtx.stroke();
      }

      const cycleDuration = 60 / heartBpm;
      bioTime += 1 / 60;
      const cyclePhase = (bioTime % cycleDuration) / cycleDuration;

      // Push latest ECG sample
      ecgBuffer.shift();
      ecgBuffer.push(computeECGVoltage(cyclePhase));

      // Push latest EEG Neural sample
      let eegFreq = eegMode === 'alpha' ? 10 : eegMode === 'beta' ? 22 : 38;
      let eegVal =
        Math.sin(bioTime * eegFreq * 1.8) * 0.45 +
        Math.cos(bioTime * (eegFreq * 0.65)) * 0.3;

      if (actionSpike > 0.02) {
        eegVal += Math.sin(bioTime * 90) * actionSpike * 1.4;
        actionSpike *= 0.92;
      }
      eegBuffer.shift();
      eegBuffer.push(eegVal);

      // Draw Channel 1: Cardiac ECG (Electric Coral)
      bCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h * 0.36 - ecgBuffer[x] * 68;
        if (x === 0) bCtx.moveTo(x, y);
        else bCtx.lineTo(x, y);
      }
      bCtx.strokeStyle = '#ff2a85';
      bCtx.lineWidth = 2.5;
      bCtx.shadowBlur = 12;
      bCtx.shadowColor = '#ff2a85';
      bCtx.stroke();

      // Draw Channel 2: Neural EEG (Emerald Cyan / Solar Gold on spike)
      bCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h * 0.76 - eegBuffer[x] * 26;
        if (x === 0) bCtx.moveTo(x, y);
        else bCtx.lineTo(x, y);
      }
      bCtx.strokeStyle = actionSpike > 0.15 ? '#ffb703' : '#00f5d4';
      bCtx.lineWidth = 2.0;
      bCtx.shadowColor = actionSpike > 0.15 ? '#ffb703' : '#00f5d4';
      bCtx.stroke();
      bCtx.shadowBlur = 0;

      requestAnimationFrame(renderBioMonitor);
    }

    renderBioMonitor();
  }
});
/**
 * ============================================================================
 * ELECTRA ENGINE — STEP 4 MODULES
 * Module 03: Web Audio API Polyphonic Fourier Synthesizer & Oscilloscope
 * Module 04: Interactive Everyday Magic Physics Blueprint Toggles
 * Module 05: Quantum Resonance Partner Tribute & Interactive Constellation
 * Engineered by: Ujan Barai | Dept. of Electrical Engineering, KGEC
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------------------------------
     MODULE 03: WEB AUDIO API FOURIER SYNTHESIZER
     -------------------------------------------------------------------------- */
  const synthCanvas = document.getElementById('synth-canvas');
  const sliderH1 = document.getElementById('slider-h1');
  const sliderH2 = document.getElementById('slider-h2');
  const sliderH3 = document.getElementById('slider-h3');
  const valH1 = document.getElementById('val-h1');
  const valH2 = document.getElementById('val-h2');
  const valH3 = document.getElementById('val-h3');

  const freqPill = document.getElementById('synth-freq-pill');
  const noteReadout = document.getElementById('synth-note-readout');
  const waveLengthEl = document.getElementById('synth-wave-length');
  const audioStateEl = document.getElementById('synth-audio-state');
  const synthKeys = document.querySelectorAll('.synth-key');
  const playChordBtn = document.getElementById('play-chord-btn');

  let activeFreq = 440.0;
  let synthPhase = 0;
  let audioGlowBoost = 0;
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize warm harmonic musical tone using Fourier additive synthesis
  function playFourierTone(freq, duration = 0.85) {
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const h1Amp = sliderH1 ? parseInt(sliderH1.value, 10) / 100 : 1.0;
    const h2Amp = sliderH2 ? parseInt(sliderH2.value, 10) / 100 : 0.45;
    const h3Amp = sliderH3 ? parseInt(sliderH3.value, 10) / 100 : 0.25;

    const harmonics = [
      { mult: 1, amp: h1Amp * 0.22 },
      { mult: 2, amp: h2Amp * 0.11 },
      { mult: 3, amp: h3Amp * 0.06 }
    ];

    harmonics.forEach((h) => {
      if (h.amp <= 0.005) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h.mult, now);

      // Smooth acoustic envelope (prevents harsh clicks)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(h.amp, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    });

    audioGlowBoost = 1.0;
    if (audioStateEl) {
      audioStateEl.textContent = 'OSCILLATING (ON)';
    }
  }

  [sliderH1, sliderH2, sliderH3].forEach((slider) => {
    if (!slider) return;
    slider.addEventListener('input', () => {
      if (valH1) valH1.textContent = `${sliderH1.value}%`;
      if (valH2) valH2.textContent = `${sliderH2.value}%`;
      if (valH3) valH3.textContent = `${sliderH3.value}%`;
    });
  });

  synthKeys.forEach((key) => {
    key.addEventListener('click', () => {
      synthKeys.forEach((k) => k.classList.remove('active'));
      key.classList.add('active');

      const note = key.getAttribute('data-note');
      const freq = parseFloat(key.getAttribute('data-freq'));
      activeFreq = freq;

      if (freqPill) freqPill.textContent = `f₀ = ${freq.toFixed(2)} Hz (${note})`;
      if (noteReadout) noteReadout.textContent = `${note} (${freq.toFixed(1)} Hz)`;
      if (waveLengthEl) {
        const lambda = (343 / freq).toFixed(2); // Speed of sound c = 343 m/s
        waveLengthEl.textContent = `${lambda} meters`;
      }

      playFourierTone(freq, 0.9);
    });
  });

  if (playChordBtn) {
    playChordBtn.addEventListener('click', () => {
      // Luminous C-Major 7th Arpeggiated Chord (C4 - E4 - G4 - B4 - C5)
      const chordFreqs = [261.63, 329.63, 392.00, 493.88, 523.25];
      chordFreqs.forEach((f, idx) => {
        setTimeout(() => {
          activeFreq = f;
          playFourierTone(f, 1.3);
        }, idx * 90);
      });
      if (noteReadout) noteReadout.textContent = 'C-Maj9 Harmonic Chord';
    });
  }

  // Real-Time Fourier Superposition Oscilloscope Loop
  if (synthCanvas) {
    const sCtx = synthCanvas.getContext('2d');
    function renderSynthOscilloscope() {
      const w = synthCanvas.width;
      const h = synthCanvas.height;

      sCtx.fillStyle = 'rgba(4, 5, 10, 0.32)';
      sCtx.fillRect(0, 0, w, h);

      const a1 = sliderH1 ? parseInt(sliderH1.value, 10) / 100 : 1.0;
      const a2 = sliderH2 ? parseInt(sliderH2.value, 10) / 100 : 0.45;
      const a3 = sliderH3 ? parseInt(sliderH3.value, 10) / 100 : 0.25;
      const norm = Math.max(0.5, a1 + a2 + a3);

      synthPhase += (activeFreq / 440) * 0.08;
      if (audioGlowBoost > 0.02) audioGlowBoost *= 0.95;

      // Draw Composite Fourier Waveform
      sCtx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (x / w) * Math.PI * 6 * (activeFreq / 320);
        const y1 = a1 * Math.sin(t + synthPhase);
        const y2 = a2 * Math.sin(2 * t + synthPhase * 1.5);
        const y3 = a3 * Math.sin(3 * t - synthPhase * 0.8);

        const combined = (y1 + y2 + y3) / norm;
        const ampScale = h * (0.34 + audioGlowBoost * 0.08);
        const y = h / 2 + combined * ampScale;

        if (x === 0) sCtx.moveTo(x, y);
        else sCtx.lineTo(x, y);
      }

      const grad = sCtx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, '#00f5d4');
      grad.addColorStop(0.5, '#ffb703');
      grad.addColorStop(1, '#ff2a85');

      sCtx.strokeStyle = grad;
      sCtx.lineWidth = 2.8 + audioGlowBoost * 1.4;
      sCtx.shadowBlur = 14 + audioGlowBoost * 10;
      sCtx.shadowColor = '#ffb703';
      sCtx.stroke();
      sCtx.shadowBlur = 0;

      requestAnimationFrame(renderSynthOscilloscope);
    }
    renderSynthOscilloscope();
  }

  /* --------------------------------------------------------------------------
     MODULE 04: EVERYDAY MAGIC BLUEPRINT CARD TOGGLES
     -------------------------------------------------------------------------- */
  const magicCards = document.querySelectorAll('.magic-card');
  magicCards.forEach((card) => {
    const btn = card.querySelector('.magic-toggle-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const currentView = card.getAttribute('data-view');
      if (currentView === 'simple') {
        card.setAttribute('data-view', 'blueprint');
        btn.textContent = '✨ Return to Everyday Explanation';
      } else {
        card.setAttribute('data-view', 'simple');
        btn.textContent = '🔍 Inspect EE Physics Blueprint';
      }
    });
  });

  /* --------------------------------------------------------------------------
     MODULE 05: SECRET PARTNER RESONANCE TRIBUTE & CONSTELLATION CANVAS
     -------------------------------------------------------------------------- */
  const unlockBtn = document.getElementById('unlock-tribute-btn');
  const lockView = document.getElementById('tribute-lock-view');
  const revealedView = document.getElementById('tribute-revealed-view');
  const statusBadge = document.getElementById('tribute-status-badge');
  const tributeCanvas = document.getElementById('tribute-canvas');

  if (unlockBtn && lockView && revealedView) {
    unlockBtn.addEventListener('click', () => {
      lockView.classList.add('hidden');
      revealedView.classList.remove('hidden');

      if (statusBadge) {
        statusBadge.className = 'status-pill status-optimal';
        statusBadge.textContent = 'RESONANCE LOCKED • ∞';
      }

      // Play warm romantic harmonic chord (F4 - A4 - C5 - E5)
      [349.23, 440.00, 523.25, 659.25].forEach((freq, i) => {
        setTimeout(() => playFourierTone(freq, 1.8), i * 120);
      });

      startConstellationAnimation();
    });
  }

  function startConstellationAnimation() {
    if (!tributeCanvas) return;
    const tCtx = tributeCanvas.getContext('2d');
    const w = tributeCanvas.width;
    const h = tributeCanvas.height;

    const stars = Array.from({ length: 36 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.2 + 1.2,
      color: Math.random() > 0.5 ? '#ffb703' : '#ff2a85'
    }));

    function drawConstellation() {
      tCtx.fillStyle = 'rgba(6, 7, 14, 0.25)';
      tCtx.fillRect(0, 0, w, h);

      for (let i = 0; i < stars.length; i++) {
        const s1 = stars[i];
        s1.x += s1.vx;
        s1.y += s1.vy;
        if (s1.x < 0 || s1.x > w) s1.vx *= -1;
        if (s1.y < 0 || s1.y > h) s1.vy *= -1;

        tCtx.beginPath();
        tCtx.arc(s1.x, s1.y, s1.r, 0, Math.PI * 2);
        tCtx.fillStyle = s1.color;
        tCtx.shadowBlur = 10;
        tCtx.shadowColor = s1.color;
        tCtx.fill();
        tCtx.shadowBlur = 0;

        for (let j = i + 1; j < stars.length; j++) {
          const s2 = stars[j];
          const d = Math.hypot(s1.x - s2.x, s1.y - s2.y);
          if (d < 95) {
            tCtx.beginPath();
            tCtx.moveTo(s1.x, s1.y);
            tCtx.lineTo(s2.x, s2.y);
            tCtx.strokeStyle = `rgba(255, 183, 3, ${(1 - d / 95) * 0.35})`;
            tCtx.lineWidth = 0.9;
            tCtx.stroke();
          }
        }
      }
      requestAnimationFrame(drawConstellation);
    }
    drawConstellation();
  }
});