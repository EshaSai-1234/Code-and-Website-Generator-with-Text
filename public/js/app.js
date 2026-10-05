/**
 * Code & Website Generator - Main Application Logic
 * Vanilla JavaScript + Monaco Editor + JSZip + Sandboxed Iframe Preview
 */

// Global State
let editor = null;
let models = {
  html: null,
  css: null,
  js: null
};
let activeTab = 'html';
let debounceTimer = null;
let iframeErrors = [];

// Templates Dictionary
const PROMPT_TEMPLATES = {
  portfolio: "A sleek developer portfolio with dark theme, dynamic navbar, hero section with typed title effect, skills grid with progress bars, filterable project cards with modal previews, experience timeline, and an interactive contact form with field validation.",
  landing: "A high-converting SaaS product landing page with a hero banner, animated features grid, interactive monthly/annual pricing toggle, customer testimonial slider, FAQ accordion, and newsletter CTA box.",
  blog: "A modern clean tech blog with a featured article banner, category filter pills, instant live search bar, estimated reading time badges, author bio card, and newsletter subscription modal.",
  ecommerce: "An interactive online store layout featuring a hero promotional slider, responsive product grid, price range slider, quick view modal, and a sliding slide-over shopping cart drawer with item counter.",
  dashboard: "An executive SaaS analytics dashboard with dark/light mode toggle, collapsible sidebar navigation, metric KPI summary cards, interactive tabular data with sorting/search, and a real-time activity feed."
};

// DOM Elements
const elements = {
  modelSelect: document.getElementById('modelSelect'),
  refreshModelsBtn: document.getElementById('refreshModelsBtn'),
  ollamaStatusDot: document.getElementById('ollamaStatusDot'),
  ollamaWarningBanner: document.getElementById('ollamaWarningBanner'),
  ollamaWarningText: document.getElementById('ollamaWarningText'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeToggleText: document.getElementById('themeToggleText'),
  promptInput: document.getElementById('promptInput'),
  generateBtn: document.getElementById('generateBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  improveBtn: document.getElementById('improveBtn'),
  fixBtn: document.getElementById('fixBtn'),
  copyBtn: document.getElementById('copyBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  clearBtn: document.getElementById('clearBtn'),
  monacoContainer: document.getElementById('monacoContainer'),
  editorPlaceholder: document.getElementById('editorPlaceholder'),
  syncStatus: document.getElementById('syncStatus'),
  previewIframe: document.getElementById('previewIframe'),
  refreshPreviewBtn: document.getElementById('refreshPreviewBtn'),
  openNewTabBtn: document.getElementById('openNewTabBtn'),
  errorLogPanel: document.getElementById('errorLogPanel'),
  errorLogList: document.getElementById('errorLogList'),
  errorCount: document.getElementById('errorCount'),
  autoFixBtn: document.getElementById('autoFixBtn'),
  dismissErrorsBtn: document.getElementById('dismissErrorsBtn'),
  toastContainer: document.getElementById('toastContainer')
};

// --- Initializing Application ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMonaco();
  initEventListeners();
  fetchAIModels();
});

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('website_generator_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeUI(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('website_generator_theme', newTheme);
  updateThemeUI(newTheme);

  if (editor) {
    monaco.editor.setTheme(newTheme === 'dark' ? 'vs-dark' : 'vs');
  }
}

function updateThemeUI(theme) {
  if (theme === 'dark') {
    elements.themeToggleBtn.querySelector('i').className = 'fa-solid fa-sun';
    elements.themeToggleText.textContent = 'Light';
  } else {
    elements.themeToggleBtn.querySelector('i').className = 'fa-solid fa-moon';
    elements.themeToggleText.textContent = 'Dark';
  }
}

// --- Monaco Editor Setup ---
function initMonaco() {
  require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

  window.MonacoEnvironment = {
    getWorkerUrl: function (workerId, label) {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/'
        };
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/base/worker/workerMain.js');
      `)}`;
    }
  };

  require(['vs/editor/editor.main'], function () {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    // Create models for HTML, CSS, JS
    models.html = monaco.editor.createModel('', 'html');
    models.css = monaco.editor.createModel('', 'css');
    models.js = monaco.editor.createModel('', 'javascript');

    // Create Editor Instance
    editor = monaco.editor.create(elements.monacoContainer, {
      model: models.html,
      theme: currentTheme === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      fontSize: 13,
      fontFamily: "'Fira Code', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      tabSize: 2,
      wordWrap: 'on'
    });

    // Model Change Listener for Live Preview Debounce
    const onContentChange = () => {
      elements.syncStatus.style.opacity = '1';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        updatePreview();
        elements.syncStatus.style.opacity = '0.5';
      }, 500);
    };

    models.html.onDidChangeContent(onContentChange);
    models.css.onDidChangeContent(onContentChange);
    models.js.onDidChangeContent(onContentChange);
  });
}

// --- Event Listeners Initialization ---
function initEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Refresh Models
  elements.refreshModelsBtn.addEventListener('click', fetchAIModels);

  // Template Chips
  document.querySelectorAll('.template-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const templateKey = chip.getAttribute('data-template');
      if (PROMPT_TEMPLATES[templateKey]) {
        elements.promptInput.value = PROMPT_TEMPLATES[templateKey];
        showToast(`Loaded ${chip.textContent.trim()} prompt template!`, 'info');
      }
    });
  });

  // Prompt Shortcut (Ctrl + Enter)
  elements.promptInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      elements.generateBtn.click();
    }
  });

  // Action Buttons
  elements.generateBtn.addEventListener('click', generateWebsite);
  elements.regenerateBtn.addEventListener('click', generateWebsite);
  elements.improveBtn.addEventListener('click', improveDesign);
  elements.fixBtn.addEventListener('click', fixCode);
  elements.copyBtn.addEventListener('click', copyCodeToClipboard);
  elements.downloadBtn.addEventListener('click', downloadZip);
  elements.clearBtn.addEventListener('click', clearWorkspace);

  // Editor Tabs
  document.querySelectorAll('.editor-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-file');

      if (editor && models[activeTab]) {
        editor.setModel(models[activeTab]);
      }
    });
  });

  // Viewport Controls
  document.querySelectorAll('.viewport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const width = btn.getAttribute('data-width');
      elements.previewIframe.style.width = width;
    });
  });

  // Preview Actions
  elements.refreshPreviewBtn.addEventListener('click', updatePreview);
  elements.openNewTabBtn.addEventListener('click', openPreviewInNewWindow);

  // Error Log Panel Actions
  elements.dismissErrorsBtn.addEventListener('click', () => {
    elements.errorLogPanel.classList.add('hidden');
  });

  elements.autoFixBtn.addEventListener('click', () => {
    fixCode();
  });

  // Listen for Runtime Errors from Iframe Bridge
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'IFRAME_ERROR') {
      handleIframeError(event.data.message);
    }
  });
}

// --- Fetch AI Models ---
async function fetchAIModels() {
  elements.ollamaStatusDot.className = 'status-dot';
  elements.modelSelect.innerHTML = '<option value="">Loading models...</option>';

  try {
    const res = await fetch('/api/models');
    const data = await res.json();

    if (data.connected && data.models.length > 0) {
      elements.ollamaStatusDot.classList.add('connected');
      elements.ollamaWarningBanner.classList.add('hidden');

      elements.modelSelect.innerHTML = data.models.map(m => 
        `<option value="${m}">${m}</option>`
      ).join('');

      showToast(`AI Models Ready! Found ${data.models.length} provider option(s).`, 'success');
    } else {
      elements.ollamaStatusDot.className = 'status-dot';
      elements.modelSelect.innerHTML = '<option value="">offline-spec-generator</option>';
    }
  } catch (err) {
    elements.ollamaStatusDot.className = 'status-dot';
    elements.modelSelect.innerHTML = '<option value="offline-spec-generator">offline-spec-generator (Built-in Spec Engine)</option>';
  }
}

// --- Live Sandboxed Iframe Preview Engine ---
function updatePreview() {
  if (!models.html) return;

  const htmlContent = models.html.getValue();
  const cssContent = models.css.getValue();
  const jsContent = models.js.getValue();

  if (!htmlContent.trim()) {
    elements.previewIframe.srcdoc = '';
    return;
  }

  clearErrorLog();

  const bridgeScript = `
    <script>
      (function() {
        window.onerror = function(msg, url, line, col, error) {
          window.parent.postMessage({
            type: 'IFRAME_ERROR',
            message: 'JS Error: ' + msg + ' (Line ' + line + ')'
          }, '*');
          return false;
        };
        const origConsoleError = console.error;
        console.error = function(...args) {
          window.parent.postMessage({
            type: 'IFRAME_ERROR',
            message: 'Console Error: ' + args.join(' ')
          }, '*');
          origConsoleError.apply(console, args);
        };
      })();
    </script>
  `;

  let fullDocument = htmlContent;

  if (fullDocument.includes('<head>')) {
    fullDocument = fullDocument.replace('<head>', `<head>${bridgeScript}`);
  } else {
    fullDocument = bridgeScript + fullDocument;
  }

  if (cssContent.trim()) {
    const styleTag = `<style>\n${cssContent}\n</style>`;
    if (fullDocument.includes('</head>')) {
      fullDocument = fullDocument.replace('</head>', `${styleTag}\n</head>`);
    } else {
      fullDocument = styleTag + fullDocument;
    }
  }

  if (jsContent.trim()) {
    const scriptTag = `<script>\ndocument.addEventListener('DOMContentLoaded', () => {\n${jsContent}\n});\n</script>`;
    if (fullDocument.includes('</body>')) {
      fullDocument = fullDocument.replace('</body>', `${scriptTag}\n</body>`);
    } else {
      fullDocument += scriptTag;
    }
  }

  elements.previewIframe.srcdoc = fullDocument;
}

function openPreviewInNewWindow() {
  const htmlContent = models.html ? models.html.getValue() : '';
  const cssContent = models.css ? models.css.getValue() : '';
  const jsContent = models.js ? models.js.getValue() : '';

  if (!htmlContent) return;

  const fullDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Generated Website Preview</title><style>${cssContent}</style></head><body>${htmlContent}<script>${jsContent}</script></body></html>`;
  
  const win = window.open();
  win.document.write(fullDoc);
  win.document.close();
}

function handleIframeError(errorMessage) {
  if (!iframeErrors.includes(errorMessage)) {
    iframeErrors.push(errorMessage);
  }

  elements.errorCount.textContent = iframeErrors.length;
  elements.errorLogList.innerHTML = iframeErrors.map(err => 
    `<div class="error-item"><i class="fa-solid fa-bug"></i> ${escapeHtml(err)}</div>`
  ).join('');

  elements.errorLogPanel.classList.remove('hidden');
  elements.fixBtn.disabled = false;
  elements.fixBtn.classList.add('pulse');
}

function clearErrorLog() {
  iframeErrors = [];
  elements.errorCount.textContent = '0';
  elements.errorLogList.innerHTML = '';
  elements.errorLogPanel.classList.add('hidden');
  elements.fixBtn.classList.remove('pulse');
}

// Generate Website
async function generateWebsite() {
  const prompt = elements.promptInput.value.trim();
  if (!prompt) {
    showToast('Please enter a website description prompt.', 'error');
    return;
  }

  const selectedModel = elements.modelSelect.value;
  setButtonLoading(elements.generateBtn, true, 'Generating...');
  elements.editorPlaceholder.classList.add('hidden');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: selectedModel })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate website code.');
    }

    models.html.setValue(data.html);
    models.css.setValue(data.css);
    models.js.setValue(data.js);

    updatePreview();
    enableActionButtons(true);

    showToast('Website generated successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(elements.generateBtn, false, 'Generate');
  }
}

// Improve Design
async function improveDesign() {
  const currentCode = {
    html: models.html.getValue(),
    css: models.css.getValue(),
    js: models.js.getValue()
  };

  if (!currentCode.html) return;

  const prompt = elements.promptInput.value.trim();
  const selectedModel = elements.modelSelect.value;

  setButtonLoading(elements.improveBtn, true, 'Improving...');

  try {
    const res = await fetch('/api/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCode, prompt, model: selectedModel })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to improve code design.');
    }

    models.html.setValue(data.html);
    models.css.setValue(data.css);
    models.js.setValue(data.js);

    updatePreview();
    showToast('Design improved successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(elements.improveBtn, false, 'Improve Design');
  }
}

// Fix Code
async function fixCode() {
  const currentCode = {
    html: models.html.getValue(),
    css: models.css.getValue(),
    js: models.js.getValue()
  };

  if (!currentCode.html) return;

  const selectedModel = elements.modelSelect.value;
  const errorDetails = iframeErrors.length > 0 ? iframeErrors.join('\n') : 'Fix syntax errors, missing styles, or broken JS handlers.';

  setButtonLoading(elements.fixBtn, true, 'Fixing...');

  try {
    const res = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCode, errorDetails, model: selectedModel })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fix code.');
    }

    models.html.setValue(data.html);
    models.css.setValue(data.css);
    models.js.setValue(data.js);

    clearErrorLog();
    updatePreview();
    showToast('Code repaired successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setButtonLoading(elements.fixBtn, false, 'Fix Code');
  }
}

// Copy current code to clipboard
async function copyCodeToClipboard() {
  if (!models[activeTab]) return;

  const content = models[activeTab].getValue();
  if (!content) {
    showToast('No code to copy.', 'error');
    return;
  }

  const fileName = activeTab === 'html' ? 'index.html' : activeTab === 'css' ? 'style.css' : 'script.js';

  try {
    await navigator.clipboard.writeText(content);
    showToast(`Copied ${fileName} to clipboard!`, 'success');
  } catch (err) {
    showToast('Failed to copy code.', 'error');
  }
}

// Download ZIP
async function downloadZip() {
  if (!models.html) return;

  const zip = new JSZip();
  zip.file("index.html", models.html.getValue());
  zip.file("style.css", models.css.getValue());
  zip.file("script.js", models.js.getValue());

  try {
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "generated-website-project.zip";
    link.click();
    URL.revokeObjectURL(link.href);

    showToast("Downloaded generated-website-project.zip!", "success");
  } catch (err) {
    showToast("Failed to create ZIP package.", "error");
  }
}

// Clear workspace
function clearWorkspace() {
  elements.promptInput.value = '';
  if (models.html) models.html.setValue('');
  if (models.css) models.css.setValue('');
  if (models.js) models.js.setValue('');

  elements.previewIframe.srcdoc = '';
  elements.editorPlaceholder.classList.remove('hidden');
  clearErrorLog();
  enableActionButtons(false);
  showToast('Workspace cleared.', 'info');
}

// Enable action buttons
function enableActionButtons(enable) {
  elements.regenerateBtn.disabled = !enable;
  elements.improveBtn.disabled = !enable;
  elements.fixBtn.disabled = !enable;
  elements.copyBtn.disabled = !enable;
  elements.downloadBtn.disabled = !enable;
}

function setButtonLoading(btn, isLoading, defaultText) {
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> <span>${defaultText}</span>`;
  } else {
    btn.disabled = false;
    btn.innerHTML = defaultText.includes('Generate') 
      ? `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>${defaultText}</span>` 
      : defaultText.includes('Improve')
      ? `<i class="fa-solid fa-gem"></i> <span>${defaultText}</span>`
      : defaultText.includes('Fix')
      ? `<i class="fa-solid fa-wrench"></i> <span>${defaultText}</span>`
      : `<span>${defaultText}</span>`;
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
