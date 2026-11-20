console.log('main.js carregou');
const elementos = document.querySelectorAll('.card, .mini-card, .panel, .stat');

elementos.forEach((el) => el.classList.add('reveal'));

const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15 }
);

elementos.forEach((el) => observador.observe(el));


const hero = document.querySelector('.hero');
const canvas = document.getElementById('strands');
const ctx = canvas.getContext('2d');

const QUANTIDADE_FIOS = 64;
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let largura = 0;
let altura = 0;
const inicio = performance.now();

function ajustarTamanho() {
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  largura = hero.clientWidth;
  altura = hero.clientHeight;
  canvas.width = largura * escala;
  canvas.height = altura * escala;
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
}

function desenhar(agora) {
  const t = (agora - inicio) / 1000;

  ctx.clearRect(0, 0, largura, altura);
  ctx.globalCompositeOperation = 'lighter';

  const centroY = altura * 0.52;
  const amplitude = altura * 0.26;
  const passo = Math.max(6, largura / 180);

  for (let i = 0; i < QUANTIDADE_FIOS; i++) {
    const k = i / (QUANTIDADE_FIOS - 1);
    const deslocamento = k - 0.5;
    const destaque = i % 7 === 0;

    ctx.beginPath();

    for (let x = -10; x <= largura + 10; x += passo) {
      const u = x / largura;
      const abertura = (0.25 + 0.75 * Math.sin(u * Math.PI * 1.15 + 0.4)) * altura * 0.62;

      const y =
        centroY +
        Math.sin(u * 5.2 + t * 0.55 + k * 7.5) * amplitude * 0.6 +
        Math.sin(u * 8.4 - t * 0.42 + k * 12) * amplitude * 0.34 +
        Math.sin(u * 2.2 + t * 0.25) * amplitude * 0.35 +
        deslocamento * abertura;

      if (x === -10) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.lineWidth = destaque ? 1.8 : 1.1;
    ctx.strokeStyle = destaque
      ? 'rgba(226, 255, 110, 0.75)'
      : 'rgba(198, 240, 31, ' + (0.22 + 0.22 * Math.sin(k * Math.PI)) + ')';
    ctx.stroke();
  }

  if (!reduzirMovimento) {
    requestAnimationFrame(desenhar);
  }
}

ajustarTamanho();
window.addEventListener('resize', () => {
  ajustarTamanho();
  if (reduzirMovimento) desenhar(performance.now());
});
requestAnimationFrame(desenhar);

const contadores = document.querySelectorAll('[data-alvo]');

function formatarContador(el, n) {
  const prefixo = el.dataset.prefixo || '';
  const sufixo = el.dataset.sufixo || '';
  const decimais = Number(el.dataset.decimais || 0);
  return (
    prefixo +
    n.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais }) +
    sufixo
  );
}

const animacoes = new WeakMap();

function animarContador(el) {
  const alvo = Number(el.dataset.alvo);
  const duracao = 1500;

  cancelAnimationFrame(animacoes.get(el));

  if (reduzirMovimento) {
    el.textContent = formatarContador(el, alvo);
    return;
  }

  const comeco = performance.now();

  function quadro(agora) {
    const progresso = Math.min((agora - comeco) / duracao, 1);
    const suavizado = 1 - Math.pow(1 - progresso, 3);

    el.textContent = formatarContador(el, alvo * suavizado);

    if (progresso < 1) {
      animacoes.set(el, requestAnimationFrame(quadro));
    }
  }

  animacoes.set(el, requestAnimationFrame(quadro));
}

function zerarContador(el) {
  cancelAnimationFrame(animacoes.get(el));
  if (!reduzirMovimento) el.textContent = formatarContador(el, 0);
}

const observadorContador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
      } else {
        zerarContador(entrada.target);
      }
    });
  },
  { threshold: 0.5 }
);

contadores.forEach((el) => observadorContador.observe(el));
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML =
  '<div class="modal-conteudo" role="dialog" aria-modal="true">' +
  '<button class="modal-fechar" aria-label="Fechar">&times;</button>' +
  '<h4></h4><img alt="">' +
  '<a href="https://wa.me/5548999141982" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Quero algo assim</a></div>';
document.body.appendChild(modal);

const modalTitulo = modal.querySelector('h4');
const modalImg = modal.querySelector('img');

function fecharModal() {
  modal.classList.remove('aberto');
}

document.querySelectorAll('[data-preview]').forEach((botao) => {
  botao.addEventListener('click', (e) => {
    e.preventDefault();
    modalTitulo.textContent = botao.dataset.titulo;
    modalImg.src = botao.dataset.preview;
    modalImg.alt = botao.dataset.titulo;
    modal.classList.add('aberto');
  });
});

modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.closest('.modal-fechar') || e.target.closest('.btn')) {
    fecharModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') fecharModal();
});

const dash = document.querySelector('.dash');
if (dash) {
  const observadorDash = new IntersectionObserver(
    (entradas) => {
      dash.classList.toggle('visivel', entradas[0].isIntersecting);
    },
    { threshold: 0.25 }
  );
  observadorDash.observe(dash);
}
