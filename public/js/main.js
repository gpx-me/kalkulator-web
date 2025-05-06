document.addEventListener('DOMContentLoaded', () => {
  // Elemen DOM
  const output = document.getElementById('output');
  const history = document.getElementById('history');
  const buttons = document.querySelectorAll('.btn');
  const toggleTheme = document.querySelector('.toggle-theme');
  
  // Variabel untuk menyimpan status kalkulator
  let currentInput = '0';
  let previousInput = '';
  let calculationHistory = '';
  let needReset = false;
  
  // Inisialisasi particles.js
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 900
          }
        },
        color: {
          value: '#9d4edd'
        },
        shape: {
          type: ['circle', 'triangle', 'polygon'],
          stroke: {
            width: 0,
            color: '#000000'
          },
          polygon: {
            nb_sides: 6
          }
        },
        opacity: {
          value: 0.4,
          random: true,
          anim: {
            enable: true,
            speed: 0.8,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#7b2cbf',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          onclick: {
            enable: true,
            mode: 'push'
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 180,
            line_linked: {
              opacity: 0.5
            }
          },
          push: {
            particles_nb: 6
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    });
  }
  
  // Animasi ripple pada tombol
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Efek ripple
      const ripple = document.createElement('span');
      this.appendChild(ripple);
      
      const x = e.clientX - this.getBoundingClientRect().left;
      const y = e.clientY - this.getBoundingClientRect().top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Hapus ripple setelah animasi selesai
      setTimeout(() => {
        ripple.remove();
      }, 600);
      
      // Animasi tombol
      button.classList.add('btn-pressed');
      setTimeout(() => {
        button.classList.remove('btn-pressed');
      }, 150);
    });
  });
  
  // Fungsi untuk memperbarui tampilan
  const updateDisplay = () => {
    output.textContent = currentInput;
    history.textContent = calculationHistory;
    
    // Animasi untuk hasil
    output.classList.remove('result-animation');
    void output.offsetWidth; // Memaksa reflow untuk reset animasi
    output.classList.add('result-animation');
  };
  
  // Fungsi untuk menangani input angka
  const handleNumberInput = (value) => {
    if (currentInput === '0' || needReset) {
      currentInput = value;
      needReset = false;
    } else {
      // Pastikan tidak ada angka ganda saat 0
      if (value === '0' && currentInput === '0') return;
      
      // Pastikan hanya ada satu titik desimal
      if (value === '.' && currentInput.includes('.')) return;
      
      // Batasi panjang input
      if (currentInput.length < 12) {
        currentInput += value;
      }
    }
    
    updateDisplay();
  };
  
  // Fungsi untuk menangani operator
  const handleOperator = (operator) => {
    // Jika ini adalah tanda pertama, gunakan nilai saat ini
    if (calculationHistory === '') {
      calculationHistory = currentInput + ' ' + operator;
    } else {
      // Jika operator sebelumnya sudah ada, lakukan kalkulasi dulu
      if (needReset) {
        calculationHistory = currentInput + ' ' + operator;
      } else {
        try {
          // Gunakan API untuk kalkulasi
          const expression = calculationHistory + ' ' + currentInput;
          calculationHistory = expression;
          
          fetch('/calculate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expression: expression.replace(/×/g, '*').replace(/÷/g, '/') }),
          })
          .then(response => response.json())
          .then(data => {
            currentInput = data.result;
            calculationHistory = currentInput + ' ' + operator;
            needReset = true;
            updateDisplay();
            
            // Efek partikel saat operasi
            if (typeof particlesJS !== 'undefined' && particlesJS.pJS) {
              pulseParticles(2);
            }
          })
          .catch(error => {
            currentInput = 'Error';
            calculationHistory = '';
            needReset = true;
            updateDisplay();
          });
          return;
        } catch (error) {
          currentInput = 'Error';
          calculationHistory = '';
          needReset = true;
          updateDisplay();
          return;
        }
      }
    }
    
    needReset = true;
    updateDisplay();
  };
  
  // Fungsi untuk menghitung hasil
  const calculate = () => {
    if (calculationHistory === '' || needReset) return;
    
    try {
      const expression = calculationHistory + ' ' + currentInput;
      
      fetch('/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: expression.replace(/×/g, '*').replace(/÷/g, '/') }),
      })
      .then(response => response.json())
      .then(data => {
        currentInput = data.result;
        calculationHistory = '';
        needReset = true;
        updateDisplay();
        
        // Animasi partikel ketika hasil dihitung
        if (typeof particlesJS !== 'undefined' && particlesJS.pJS) {
          pulseParticles(5);
        }
      })
      .catch(error => {
        currentInput = 'Error';
        calculationHistory = '';
        needReset = true;
        updateDisplay();
      });
    } catch (error) {
      currentInput = 'Error';
      calculationHistory = '';
      needReset = true;
      updateDisplay();
    }
  };
  
  // Fungsi untuk efek pulse pada partikel
  const pulseParticles = (intensity = 3) => {
    const pJS = particlesJS.pJS;
    // Simpan nilai asli
    const originalSpeed = pJS.particles.move.speed;
    const originalOpacity = pJS.particles.opacity.value;
    
    // Tingkatkan nilai untuk efek pulse
    pJS.particles.move.speed = originalSpeed * intensity;
    pJS.particles.opacity.value = Math.min(originalOpacity * 1.5, 0.8);
    
    // Pulihkan nilai asli setelah beberapa waktu
    setTimeout(() => {
      pJS.particles.move.speed = originalSpeed;
      pJS.particles.opacity.value = originalOpacity;
    }, 800);
  };
  
  // Fungsi untuk menghapus satu karakter
  const deleteLastCharacter = () => {
    if (currentInput.length === 1 || currentInput === 'Error') {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
  };
  
  // Fungsi untuk menghapus semua
  const clearAll = () => {
    currentInput = '0';
    calculationHistory = '';
    needReset = false;
    updateDisplay();
    
    // Mini efek pulse pada clear
    if (typeof particlesJS !== 'undefined' && particlesJS.pJS) {
      pulseParticles(1.5);
    }
  };
  
  // Event listener untuk tombol kalkulator
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.value;
      const action = button.dataset.action;
      
      if (value) {
        // Jika tombol adalah angka atau titik desimal
        if (!isNaN(value) || value === '.') {
          handleNumberInput(value);
        }
        // Jika tombol adalah operator
        else if (['+', '-', '*', '/', '%'].includes(value)) {
          handleOperator(value);
        }
      } else if (action) {
        // Aksi khusus
        switch (action) {
          case 'clear':
            clearAll();
            break;
          case 'delete':
            deleteLastCharacter();
            break;
          case 'calculate':
            calculate();
            break;
        }
      }
    });
  });
  
  // Event listener untuk keyboard
  document.addEventListener('keydown', (event) => {
    // Angka dan operator
    if (/^[0-9.]$/.test(event.key)) {
      handleNumberInput(event.key);
    } else if (['+', '-', '*', '/', '%'].includes(event.key)) {
      handleOperator(event.key);
    } 
    // Tombol khusus
    else if (event.key === 'Enter' || event.key === '=') {
      calculate();
    } else if (event.key === 'Backspace') {
      deleteLastCharacter();
    } else if (event.key === 'Escape' || event.key === 'Delete') {
      clearAll();
    }
  });
  
  // Toggle efek visual pada tombol tema tanpa mengubah tema
  toggleTheme.addEventListener('click', () => {
    // Animasi toggle
    toggleTheme.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      toggleTheme.style.transform = '';
    }, 300);
    
    // Efek pulse pada particles
    if (typeof particlesJS !== 'undefined' && particlesJS.pJS) {
      pulseParticles(3);
    }
  });
  
  // Inisialisasi tampilan
  updateDisplay();
  
  // Tambahkan animasi intro
  setTimeout(() => {
    document.querySelector('.calculator').classList.add('fadeIn');
    // Initial pulse pada partikel
    if (typeof particlesJS !== 'undefined' && particlesJS.pJS) {
      pulseParticles(2);
    }
  }, 100);
}); 