<?php 
include 'tracker.php';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>NEXIUS AI - INTELLIGENCE ARTIFICIELLE</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="HandheldFriendly" content="true">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4caf50; /* Vert clair futuriste */
      --secondary: #8bc34a; /* Vert secondaire */
      --accent: #00bcd4; /* Cyan futuriste */
      --text: #263238; /* Gris foncé pour texte */
      --light: #f1f8e9; /* Vert très clair */
      --dark: #37474f; /* Gris foncé */
      --user-bubble: #00bcd4; /* Cyan pour l'utilisateur */
      --assistant-bubble: #e8f5e9; /* Vert très clair pour l'IA */
      --error: #f44336; /* Rouge pour les erreurs */
      --image-bubble: #e0f7fa; /* Fond cyan clair pour images */
      --future-glow: rgba(76, 175, 80, 0.4); /* Effet glow futuriste */
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #f1f8e9 0%, #c8e6c9 100%);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--text);
    }

    .chat-container {
      width: 95%;
      max-width: 900px;
      height: 90vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .chat-header {
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      box-shadow: 0 2px 10px var(--future-glow);
    }

    .logo {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .logo-icon {
      margin-right: 10px;
      font-size: 1.5rem;
    }

    .menu-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      margin-right: 15px;
      display: flex;
      align-items: center;
      transition: transform 0.2s;
    }

    .menu-btn:active {
      transform: scale(0.9);
    }

    .chat-log {
      padding: 20px;
      flex: 1;
      overflow-y: auto;
      background-color: var(--light);
      scroll-behavior: smooth;
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(76, 175, 80, 0.1) 1px, transparent 0);
      background-size: 20px 20px;
    }

    .message {
      display: flex;
      margin-bottom: 20px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .bubble {
      padding: 12px 16px;
      border-radius: 16px;
      max-width: 85%;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      transition: all 0.2s ease;
      position: relative;
    }

    .user .bubble {
      background-color: var(--user-bubble);
      color: white;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }

    .assistant .bubble {
      background-color: var(--assistant-bubble);
      margin-right: auto;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(76, 175, 80, 0.1);
    }

    .image .bubble {
      background-color: var(--image-bubble);
      margin-right: auto;
      border-bottom-left-radius: 4px;
      padding: 10px;
    }

    .generated-image {
      max-width: 100%;
      border-radius: 8px;
      margin-top: 8px;
      border: 1px solid rgba(0, 188, 212, 0.3);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .typing .bubble {
      position: relative;
    }

    .typing .bubble::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 10px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--primary);
      box-shadow: 15px 0 0 var(--primary), 30px 0 0 var(--primary);
      animation: typing 1.5s infinite;
    }

    @keyframes typing {
      0% { opacity: 0.4; }
      50% { opacity: 1; }
      100% { opacity: 0.4; }
    }

    .role-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .user .role-icon {
      background: var(--user-bubble);
      color: white;
    }

    .assistant .role-icon {
      background: var(--primary);
      color: white;
    }

    .image .role-icon {
      background: var(--accent);
      color: white;
    }

    .chat-input-container {
      padding: 15px;
      border-top: 1px solid rgba(0,0,0,0.08);
      background: white;
    }

    .chat-input-wrapper {
      display: flex;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .chat-input {
      flex: 1;
      padding: 14px 16px;
      border: none;
      outline: none;
      font-size: 15px;
      background: white;
    }

    .send-btn {
      padding: 0 20px;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .send-btn:hover {
      opacity: 0.9;
    }

    .send-btn:active {
      transform: scale(0.95);
    }

    .send-icon {
      font-size: 18px;
    }

    .markdown-content ul, .markdown-content ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }

    .markdown-content li {
      margin-bottom: 0.3em;
    }

    .markdown-content code {
      background: rgba(0,0,0,0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .markdown-content pre {
      background: var(--dark);
      color: var(--light);
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 10px 0;
    }

    .markdown-content pre code {
      background: transparent;
      padding: 0;
    }

    .loading-dots {
      display: flex;
      padding: 10px 0;
    }

    .loading-dots span {
      width: 8px;
      height: 8px;
      margin: 0 3px;
      background-color: var(--primary);
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading-dots span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 var(--future-glow); }
      70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
      100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
    }

    .sidebar {
      position: absolute;
      top: 0;
      left: -300px;
      width: 300px;
      height: 100%;
      background: white;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      z-index: 5;
      overflow-y: auto;
    }

    .sidebar.open {
      left: 0;
    }

    .sidebar-header {
      padding: 20px;
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .sidebar-title {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .close-sidebar {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .history-item {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .history-item:hover {
      background: #f5f5f5;
    }

    .history-item-preview {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #666;
      font-size: 0.9rem;
    }

    .mode-selector {
      display: flex;
      margin-bottom: 15px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .mode-btn {
      flex: 1;
      padding: 10px;
      border: none;
      background: #f1f3f5;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      font-weight: 500;
    }

    .mode-btn.active {
      background: linear-gradient(to right, var(--primary), var(--secondary));
      color: white;
    }

    .premium-banner {
      background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin: 15px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .premium-btn {
      background: white;
      color: var(--primary);
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      margin-top: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .premium-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .chat-input-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-input {
      flex-grow: 1;
      padding: 8px 12px;
      font-size: 16px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    .voice-btn, .send-btn {
      border: none;
      background-color: var(--primary);
      color: white;
      border-radius: 8px;
      font-size: 18px;
      padding: 6px 12px;
      transition: background-color 0.3s ease;
    }

    .voice-btn:hover, .send-btn:hover {
      background-color: #3d8b40;
    }

    .voice-btn:focus, .send-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 4;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .overlay.active {
      opacity: 1;
      pointer-events: all;
    }

    .error-message {
      color: var(--error);
      background-color: #ffebee;
      padding: 10px;
      border-radius: 8px;
      margin: 5px 0;
      border-left: 4px solid var(--error);
    }

    .image-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .image-footer button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* ==================== */
    /* Responsive Design */
    /* ==================== */

    @media (max-width: 768px) {
      body {
        padding: 10px;
        min-height: 100vh;
        height: auto;
      }

      .chat-container {
        width: 100%;
        height: 95vh;
        max-width: 100%;
        border-radius: 12px;
      }

      .chat-header {
        padding: 12px 15px;
      }

      .logo {
        font-size: 1rem;
      }

      .logo-icon {
        font-size: 1.2rem;
        margin-right: 8px;
      }

      .menu-btn {
        font-size: 1.2rem;
        margin-right: 10px;
      }

      .chat-log {
        padding: 15px 10px;
      }

      .message {
        margin-bottom: 15px;
      }

      .bubble {
        max-width: 75%;
        padding: 10px 12px;
        font-size: 14px;
      }

      .role-icon {
        width: 30px;
        height: 30px;
        font-size: 14px;
        margin-right: 8px;
      }

      .chat-input-container {
        padding: 10px;
      }

      .mode-selector {
        margin-bottom: 10px;
      }

      .mode-btn {
        padding: 8px;
        font-size: 14px;
      }

      .chat-input {
        padding: 10px 12px;
        font-size: 14px;
      }

      .voice-btn, .send-btn {
        padding: 5px 10px;
        font-size: 16px;
      }

      .sidebar {
        width: 85%;
        left: -85%;
      }

      .generated-image {
        max-width: 100%;
        height: auto;
      }

      /* Optimisation pour petits écrans */
      @media (max-width: 480px) {
        .bubble {
          max-width: 70%;
        }

        .role-icon {
          width: 25px;
          height: 25px;
          font-size: 12px;
        }

        .chat-input-wrapper {
          gap: 5px;
        }

        #status-indicator {
          display: none;
        }
      }

      /* Correction pour iOS */
      @supports (-webkit-touch-callout: none) {
        .chat-container {
          height: -webkit-fill-available;
        }
      }
    }

    /* Améliorations tactiles */
    button, .history-item, .mode-btn {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    /* Empêcher le zoom sur l'input */
    @media (max-width: 768px) {
      input, textarea {
        font-size: 16px !important;
      }
    }

    /* Optimisation des animations */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Effet futuriste pour les bulles de l'IA */
    .assistant .bubble::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 18px;
      background: linear-gradient(45deg, 
        rgba(76, 175, 80, 0.3), 
        rgba(139, 195, 74, 0.3), 
        rgba(0, 188, 212, 0.3));
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .assistant .bubble:hover::before {
      opacity: 1;
    }

    /* Animation du logo */
    .logo-icon {
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  </style>
</head>
<body>

<div class="overlay" id="overlay"></div>

<div class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-title">Historique des conversations</div>
    <button class="close-sidebar" id="close-sidebar">&times;</button>
  </div>
  <div id="history-list"></div>
  
  <div class="premium-banner">
    <h3>NEXIUS AI Premium 1.2</h3>
    <p>Accédez à des fonctionnalités avancées et une puissance accrue</p>
    <button class="premium-btn" id="premium-btn">Acheter maintenant</button>
  </div>
</div>

<div class="chat-container">
  <div class="chat-header">
    <button class="menu-btn" id="menu-btn"><i class="fas fa-bars"></i></button>
    <div class="logo">
      <span class="logo-icon">🧠</span>
      <span>NEXIUS AI</span>
    </div>
    <div id="status-indicator">En ligne</div>
  </div>
  
  <div class="chat-log" id="chat-log">
    <!-- Messages will appear here -->
  </div>
  
  <div class="chat-input-container">
    <div class="mode-selector">
      <button class="mode-btn active" id="text-mode">Texte</button>
      <button class="mode-btn" id="image-mode">Image</button>
    </div>
    
    <div class="chat-input-wrapper">
      <input type="text" class="chat-input" id="user-input" placeholder="Posez votre question à NEXIUS AI..." autocomplete="off">
      <button class="voice-btn" id="voice-btn" title="Cliquer pour parler"><i class="fas fa-microphone"></i></button>
      <button class="send-btn" id="send-btn">
        <span class="send-icon"><i class="fas fa-paper-plane"></i></span>
      </button>
    </div>
  </div>
</div>

<script>
  // Configuration
  const API_KEY = "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";
  const STORAGE_KEY = "nexius_ai_chat_history";
  const IMAGE_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
  
  let conversationHistory = [];
  let isStreaming = false;
  let currentMessage = "";
  let currentMode = "text";

  // Initialisation
  $(document).ready(function() {
    loadHistory();
    setupEventListeners();
    
    // Welcome message
    setTimeout(() => {
      addMessage("assistant", `Bonjour ! Je suis NEXIUS AI, votre assistant intelligent. Je peux :\n\n- Répondre à vos questions (mode Texte)\n- Générer des images (mode Image)\n\nChoisissez un mode et commencez !`, true);
    }, 500);
    
    $("#user-input").focus();
  });

  // Setup event listeners
  function setupEventListeners() {
    // Send message
    $("#send-btn").click(sendMessage);
    $("#user-input").keypress(function(e) {
      if (e.which === 13 && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Mode selection
    $("#text-mode").click(() => switchMode("text"));
    $("#image-mode").click(() => switchMode("image"));

    // Sidebar
    $("#menu-btn").click(toggleSidebar);
    $("#close-sidebar").click(closeSidebar);
    $("#overlay").click(closeSidebar);

    // Premium button
    $("#premium-btn").click(() => {
      alert("NEXIUS AI Premium 1.2 offre :\n\n- Génération d'images plus rapide\n- Accès à des modèles premium\n- Support prioritaire\n\nContact : contact@nexius-ai.com");
    });

    // Voice recognition
    setupVoiceRecognition();

    // Détection du tactile
    document.body.classList.add(
      'ontouchstart' in window || navigator.maxTouchPoints 
        ? 'is-touch' 
        : 'no-touch'
    );

    // Empêcher le zoom sur mobile
    document.addEventListener('dblclick', function(e) {
      e.preventDefault();
    }, { passive: false });

    // Gestion du clavier virtuel
    window.addEventListener('resize', function() {
      if (window.innerHeight < 500) {
        setTimeout(scrollToBottom, 300);
      }
    });
  }

  // Switch between text and image modes
  function switchMode(mode) {
    currentMode = mode;
    $("#text-mode, #image-mode").removeClass("active");
    $(`#${mode}-mode`).addClass("active");
    
    const placeholder = mode === "text" 
      ? "Posez votre question à NEXIUS AI..." 
      : "Décrivez l'image que vous souhaitez générer...";
      
    $("#user-input").attr("placeholder", placeholder);
  }

  // Send message handler
  async function sendMessage() {
    const input = $("#user-input").val().trim();
    if (input === "" || isStreaming) return;

    addMessage("user", input);
    $("#user-input").val("");
    
    if (currentMode === "text") {
      await generateTextResponse(input);
    } else {
      await generateImage(input);
    }
  }

  // Generate text response
  async function generateTextResponse(prompt) {
    isStreaming = true;
    currentMessage = "";
    
    const typingElement = addTypingIndicator();
    const bubble = typingElement.find(".bubble");
    
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "NEXIUS AI"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [{ role: "user", content: prompt }],
          stream: true,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (isStreaming) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data:') && !line.includes('[DONE]')) {
            const data = JSON.parse(line.substring(5));
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              currentMessage += data.choices[0].delta.content;
              bubble.html(marked.parse(currentMessage));
              scrollToBottom();
            }
          }
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      bubble.html(`<div class="error-message">Erreur: ${error.message}</div>`);
    } finally {
      removeTypingIndicator();
      if (currentMessage) {
        addMessage("assistant", currentMessage, true);
        saveToHistory(prompt, currentMessage, false);
      }
      isStreaming = false;
    }
  }

  // Generate image from prompt (with fallback)
  async function generateImage(prompt) {
    isStreaming = true;
    const typingElement = addTypingIndicator(true);
    const bubble = typingElement.find(".bubble");
    
    try {
      // Try Hugging Face API first
      const hfResponse = await fetch(IMAGE_API_URL, {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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", // Replace with your token
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: prompt,
          options: { wait_for_model: true }
        })
      });

      if (hfResponse.ok) {
        const imageBlob = await hfResponse.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        addImageMessage(imageUrl, prompt);
        saveToHistory(prompt, imageUrl, true);
        return;
      }

      // Fallback to local generation if API fails
      const fallbackUrl = await generateFallbackImage(prompt);
      addImageMessage(fallbackUrl, prompt);
      saveToHistory(prompt, fallbackUrl, true);
      
    } catch (error) {
      console.error("Erreur:", error);
      bubble.html(`
        <div class="error-message">
          <strong>Erreur de génération d'image</strong><br><br>
          Essayez une description plus simple ou réessayez plus tard.
        </div>
      `);
    } finally {
      isStreaming = false;
    }
  }

  // Fallback image generation
  async function generateFallbackImage(prompt) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#4caf50');
    gradient.addColorStop(1, '#00bcd4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add prompt text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(prompt.substring(0, 50), 256, 256);
    
    return canvas.toDataURL('image/jpeg');
  }

  // Add image message to chat
  function addImageMessage(imageUrl, prompt) {
    removeTypingIndicator();
    
    const messageHtml = `
      <div class="message image">
        <div class="role-icon">🖼️</div>
        <div class="bubble">
          Voici votre image: "${prompt}"
          <img src="${imageUrl}" class="generated-image">
          <div class="image-footer">
            <button onclick="downloadImage('${imageUrl}', 'nexius-image.jpg')">
              <i class="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>
      </div>`;
    
    $("#chat-log").append(messageHtml);
    scrollToBottom();
  }

  // Download image helper
  function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  // Add typing indicator
  function addTypingIndicator(isImage = false) {
    const icon = isImage ? "🖼️" : "🧠";
    const text = isImage ? "Génération d'image en cours..." : "Réflexion en cours...";
    
    const typingHtml = `
      <div class="message assistant typing">
        <div class="role-icon">${icon}</div>
        <div class="bubble">
          ${text}
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>`;
    
    $("#chat-log").append(typingHtml);
    scrollToBottom();
    return $("#chat-log .message").last();
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    $(".typing").remove();
  }

  // Add message to chat
  function addMessage(role, content, isMarkdown = false) {
    const roleClass = role === "user" ? "user" : "assistant";
    const icon = role === "user" ? "👤" : "🧠";
    
    const messageHtml = `
      <div class="message ${roleClass}">
        <div class="role-icon">${icon}</div>
        <div class="bubble ${isMarkdown ? 'markdown-content' : ''}">
          ${isMarkdown ? marked.parse(content) : content}
        </div>
      </div>`;
    
    $("#chat-log").append(messageHtml);
    scrollToBottom();
  }

  // Scroll to bottom
  function scrollToBottom() {
    const chatLog = $("#chat-log")[0];
    chatLog.scrollTop = chatLog.scrollHeight;
    
    // Correction pour mobile
    setTimeout(() => {
      chatLog.scrollTop = chatLog.scrollHeight;
    }, 100);
  }

  // History management
  function loadHistory() {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      conversationHistory = JSON.parse(savedHistory);
      renderHistoryList();
    }
  }

  function saveToHistory(userInput, assistantReply, isImage = false) {
    conversationHistory.push({
      user: userInput,
      assistant: assistantReply,
      isImage: isImage,
      timestamp: new Date().toISOString()
    });
    
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversationHistory));
    renderHistoryList();
  }

  function renderHistoryList() {
    const historyList = $("#history-list");
    historyList.empty();
    
    if (conversationHistory.length === 0) {
      historyList.append('<div class="history-item">Aucun historique disponible</div>');
      return;
    }
    
    conversationHistory.forEach((item, index) => {
      const preview = item.user.length > 30 ? item.user.substring(0, 30) + '...' : item.user;
      const historyItem = $(`
        <div class="history-item" data-index="${index}">
          <div><strong>${item.isImage ? '🖼️ Image' : '📝 Texte'}</strong></div>
          <div class="history-item-preview">${preview}</div>
        </div>
      `);
      
      historyItem.click(() => {
        loadConversation(index);
        closeSidebar();
      });
      
      historyList.append(historyItem);
    });
  }

  function loadConversation(index) {
    if (index < 0 || index >= conversationHistory.length) return;
    
    const conversation = conversationHistory[index];
    $("#chat-log").empty();
    
    addMessage("user", conversation.user);
    if (conversation.isImage) {
      addImageMessage(conversation.assistant, conversation.user);
    } else {
      addMessage("assistant", conversation.assistant, true);
    }
  }

  // Sidebar functions
  function toggleSidebar() {
    $("#sidebar").toggleClass("open");
    $("#overlay").toggleClass("active");
    loadHistory();
  }

  function closeSidebar() {
    $("#sidebar").removeClass("open");
    $("#overlay").removeClass("active");
  }

  // Voice recognition setup
  function setupVoiceRecognition() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      // Optimisation mobile
      voiceBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        recognition.start();
      }, { passive: false });

      voiceBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        recognition.stop();
      }, { passive: false });

      recognition.onstart = () => {
        voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        voiceBtn.title = "Cliquer pour arrêter";
        voiceBtn.style.backgroundColor = '#f44336';
      };

      recognition.onend = () => {
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.title = "Cliquer pour parler";
        voiceBtn.style.backgroundColor = '';
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        $("#user-input").val(finalTranscript);
      };

      voiceBtn.addEventListener('click', function() {
        if (recognition.recording) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });
    } else {
      voiceBtn.style.display = 'none';
    }
  }
</script>
</body>
</html>