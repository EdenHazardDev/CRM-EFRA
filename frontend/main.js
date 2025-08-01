// HERO SLIDER AUTOMÁTICO
let current = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if (i === index) slide.classList.add("active");
  });
}

setInterval(() => {
  current = (current + 1) % slides.length;
  showSlide(current);
}, 4000);

// ANIMACIÓN FADE-IN AL HACER SCROLL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".feature").forEach(el => observer.observe(el));

// FORMULARIO CON VALIDACIÓN Y RECAPTCHA
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario');
  const status = document.getElementById('status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const nombre = formData.get('nombre').trim();
    const email = formData.get('email').trim();
    const mensaje = formData.get('mensaje').trim();
    const terminos = document.getElementById('terminos').checked;

    let captchaToken;
    try {
      captchaToken = grecaptcha.getResponse();
    } catch (error) {
      status.textContent = 'No se pudo cargar reCAPTCHA.';
      return;
    }

    if (!nombre || !email || !mensaje) {
      status.textContent = 'Completa todos los campos.';
      return;
    }

    if (!terminos) {
      status.textContent = 'Debes aceptar los Términos y Condiciones.';
      return;
    }

    if (!captchaToken) {
      status.textContent = 'Por favor completa el reCAPTCHA.';
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje, token: captchaToken })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        status.textContent = 'Mensaje enviado con éxito ✅';
        form.reset();
        grecaptcha.reset(); // Reinicia el captcha
      } else {
        status.textContent = data.error || 'Error al enviar el mensaje ❌';
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'No se pudo conectar con el servidor ❌';
    }
  });
});
