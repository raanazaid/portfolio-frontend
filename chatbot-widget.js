const CHATBOT_CONFIG = {
  contentUrl: "./chatbot-content.json",
  backendChatEndpoint: "https://portfolio-backend-phi-woad.vercel.app/api/chat",
  assistantName: "Zaid's AI Assistant",
};

const STATE_MODES = { CHAT: 'chat', LEAD: 'lead' };

const state = {
  content: null,
  mode: STATE_MODES.CHAT,
  leadStep: 0,
  leadData: { name: '', project: '', contact: '' },
  leadPromptSent: false,
};

// CORS/Local Fallback Content
const FALLBACK_CONTENT = {
  greeting: "Hi there! I'm Zaid's AI assistant. I can help with services, FAQs, or start a project consultation. What's on your mind?",
  bio: "Zaid is a full-stack AI Developer specializing in Autonomous Agents, LLM Integrations, and custom Data Engineering. He builds production-ready AI solutions for startups and enterprises.",
  services: [
    { title: "AI Agents", description: "Autonomous workflows for internal ops and customer support." },
    { title: "AI Automation", description: "End-to-end process automation and CRM integrations." }
  ],
  faqs: [
    { question: "How to hire Zaid?", answer: "You can reach out via the contact form on the main site or talk to me right here!" }
  ],
  leadCapture: {
    prompt: "I'd love to get Zaid involved in your project. Let's start with a quick consultation.",
    email: "mailto:muhammadzaidfida@gmail.com",
    whatsapp: "https://wa.me/923466688100"
  }
};

const els = {
  toggle: document.getElementById("chatbotToggle"),
  window: document.getElementById("chatbotWindow"),
  close: document.getElementById("chatbotClose"),
  body: document.getElementById("chatbotBody"),
  quickReplies: document.getElementById("chatbotQuickReplies"),
  form: document.getElementById("chatbotForm"),
  input: document.getElementById("chatbotInput"),
};

function escapeHtml(text = "") {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scrollToBottom() {
  els.body.scrollTop = els.body.scrollHeight;
}

function appendMessage(text, role = "bot", allowHtml = false) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  if (allowHtml) {
    message.classList.add("rich");
  }
  message.innerHTML = allowHtml ? text : escapeHtml(text);
  els.body.appendChild(message);
  scrollToBottom();
  return message;
}

function setTyping(isTyping) {
  const existing = document.getElementById("chatbotTyping");
  if (isTyping && !existing) {
    const typing = document.createElement("div");
    typing.id = "chatbotTyping";
    typing.className = "chat-message bot";
    typing.innerHTML =
      '<span class="typing"><span></span><span></span><span></span></span>';
    els.body.appendChild(typing);
    scrollToBottom();
  }

  if (!isTyping && existing) {
    existing.remove();
  }
}

function buildQuickReplyButton(label, category, value) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "quick-reply";
  button.dataset.category = category;
  button.dataset.value = value;
  button.textContent = label;
  return button;
}

function renderQuickReplies() {
  els.quickReplies.innerHTML = "";
  const fragment = document.createDocumentFragment();
  fragment.appendChild(buildQuickReplyButton("Services", "menu", "services"));
  fragment.appendChild(buildQuickReplyButton("FAQs", "menu", "faqs"));
  fragment.appendChild(buildQuickReplyButton("Contact", "menu", "contact"));

  els.quickReplies.appendChild(fragment);
}

function buildServicesListText() {
  const lines = state.content.services.map(
    (service, index) => `${index + 1}. ${service.title} - ${service.description}`
  );
  return `Here is what Zaid can help with:\n${lines.join(
    "\n\n"
  )}\n\nReply with a service name if you want details on one.`;
}

function buildFaqListText() {
  const lines = state.content.faqs.map(
    (faq, index) => `${index + 1}. ${faq.question}\n${faq.answer}`
  );
  return `Great question. Here are the most common FAQs:\n\n${lines.join(
    "\n\n"
  )}`;
}

function showServiceButtons() {
  const buttons = state.content.services
    .map(
      (service) =>
        `<button type="button" class="service-choice" data-service="${escapeHtml(
          service.title
        )}">${escapeHtml(service.title)}</button>`
    )
    .join("");

  const html = `
    <div>
      <p class="inline-title">Choose a service:</p>
      <div class="inline-actions">${buttons}</div>
    </div>
  `;

  appendMessage(html, "bot", true);
}

function showFaqButtons() {
  const buttons = state.content.faqs
    .map(
      (faq) =>
        `<button type="button" class="faq-choice" data-faq="${escapeHtml(
          faq.question
        )}">${escapeHtml(faq.question)}</button>`
    )
    .join("");

  const html = `
    <div>
      <p class="inline-title">Choose a question:</p>
      <div class="inline-actions">${buttons}</div>
    </div>
  `;

  appendMessage(html, "bot", true);
}

function showLeadCapture(force = false) {
  if (state.leadPromptSent && !force) return;
  state.leadPromptSent = true;

  const lead = state.content.leadCapture;
  const prompt = `
    <div class="contact-card">
      <p class="contact-copy">${escapeHtml(lead.prompt)}</p>
      <div class="contact-actions">
        <a href="${lead.email}" class="contact-icon-link" data-kind="email" target="_blank" rel="noopener noreferrer" aria-label="Email">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5 8L12 13L19 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Email</span>
        </a>
        <a href="${lead.whatsapp}" class="contact-icon-link" data-kind="whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4.75C8 4.75 4.75 7.93 4.75 11.85C4.75 13.35 5.24 14.73 6.07 15.85L5.17 19.25L8.7 18.33C9.72 18.94 10.83 19.25 12 19.25C16 19.25 19.25 16.07 19.25 12.15C19.25 8.23 16 4.75 12 4.75Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M9.6 9.9C9.86 9.41 10.03 9.38 10.27 9.39C10.45 9.39 10.66 9.39 10.87 9.39C11.03 9.39 11.22 9.45 11.3 9.66C11.4 9.91 11.63 10.52 11.67 10.61C11.74 10.78 11.71 10.88 11.58 10.99C11.46 11.1 11.31 11.27 11.22 11.37C11.12 11.47 11.02 11.57 11.14 11.79C11.26 12 11.67 12.68 12.35 13.28C13.23 14.06 13.97 14.3 14.2 14.39C14.43 14.48 14.56 14.46 14.67 14.34C14.78 14.22 15.15 13.79 15.29 13.6C15.42 13.4 15.56 13.43 15.78 13.51C16 13.59 17.18 14.15 17.42 14.27C17.67 14.39 17.83 14.45 17.89 14.55C17.95 14.65 17.95 15.15 17.68 15.66C17.42 16.18 16.91 16.64 16.36 16.77C15.83 16.89 15.2 16.94 13.32 16.13C11.37 15.28 9.89 13.45 9.49 12.89C9.1 12.33 8.12 10.98 8.12 9.57C8.12 8.15 8.9 7.45 9.2 7.13C9.5 6.82 9.86 6.74 10.08 6.74" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  `;

  appendMessage(prompt, "bot", true);
}

async function fetchLLMResponse(query) {
  // Enhanced Bio Context for 'out of question' replies
  const bio = state.content?.bio || FALLBACK_CONTENT.bio;
  const services = (state.content?.services || FALLBACK_CONTENT.services).map(s => s.title).join(", ");
  
  const systemPrompt = `You are Zaid's AI Portfolio Assistant. Zaid is an AI Developer experts in ${services}. ${bio}. Keep answers extremely concise (under 3 sentences), professional, and helpful. If you don't know something about him, stay positive and suggest starting a project consultation.`;

  try {
    const response = await fetch(CHATBOT_CONFIG.backendChatEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<s>[INST] ${systemPrompt} \n\n User Question: ${query} [/INST]`,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.6,
          return_full_text: false,
        }
      }),
    });

    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();
    if (!Array.isArray(data) || !data[0]?.generated_text) throw new Error("INVALID_DATA");

    return data[0].generated_text.trim();
  } catch (error) {
    console.error("LLM Error:", error);
    // Smart Local Fallback Search
    return localKnowledgeSearch(query);
  }
}

function localKnowledgeSearch(query) {
  const normalized = query.toLowerCase();
  const allInfo = [
    ...(state.content?.services || FALLBACK_CONTENT.services),
    ...(state.content?.faqs || FALLBACK_CONTENT.faqs)
  ];
  
  // Find best keyword match
  const match = allInfo.find(item => 
    (item.title && normalized.includes(item.title.toLowerCase())) || 
    (item.question && normalized.includes(item.question.toLowerCase()))
  );

  if (match) return match.description || match.answer;
  
  return "I'm having a slight sync issue with my AI brain, but I'm great at taking messages! Would you like to start a project consultation so Zaid can get back to you personally?";
}

function processLeadFlow(text) {
  appendMessage(text, "user");
  
  if (state.leadStep === 0) {
    state.leadData.name = text;
    state.leadStep = 1;
    appendMessage(`Nice to meet you, ${text}! Could you tell me a bit about the project or AI solution you're looking for?`, "bot");
  } else if (state.leadStep === 1) {
    state.leadData.project = text;
    state.leadStep = 2;
    appendMessage("Understood. I'll make sure Zaid sees those details. Finally, what's a good email or phone number where he can reach you?", "bot");
  } else if (state.leadStep === 2) {
    state.leadData.contact = text;
    state.leadStep = 3;
    state.mode = STATE_MODES.CHAT; // Reset to chat
    
    const summary = `
      <div class="lead-summary">
        <p><strong>Lead Captured!</strong></p>
        <p>I've noted everything down. Since I'm an AI, you should also click below to send this info directly to Zaid's inbox so he can reply ASAP:</p>
        <div class="contact-actions" style="margin-top:10px">
          <a href="mailto:muhammadzaidfida@gmail.com?subject=New Project Inquiry: ${encodeURIComponent(state.leadData.name)}&body=Name: ${encodeURIComponent(state.leadData.name)}%0AProject: ${encodeURIComponent(state.leadData.project)}%0AContact: ${encodeURIComponent(state.leadData.contact)}" class="contact-icon-link">
             <i class="ph ph-envelope"></i> <span>Send to Zaid</span>
          </a>
        </div>
      </div>
    `;
    appendMessage(summary, "bot", true);
  }
}

async function handleUserMessage(userText) {
  if (state.mode === STATE_MODES.LEAD) {
    processLeadFlow(userText);
    return;
  }

  appendMessage(userText, "user");
  const normalized = userText.toLowerCase();

  // Keyword triggering lead capture
  const leadTriggers = ["hire", "work", "project", "consult", "build", "price", "cost", "start"];
  if (leadTriggers.some(t => normalized.includes(t))) {
    state.mode = STATE_MODES.LEAD;
    state.leadStep = 0;
    appendMessage("I'd love to help start that conversation! First, who am I speaking with? (What's your name?)", "bot");
    return;
  }

  const serviceMatch = (state.content?.services || FALLBACK_CONTENT.services).find((service) =>
    normalized.includes(service.title.toLowerCase())
  );
  if (serviceMatch) {
    appendMessage(serviceMatch.description, "bot");
    return;
  }

  const faqMatch = (state.content?.faqs || FALLBACK_CONTENT.faqs).find((faq) =>
    normalized.includes(faq.question.toLowerCase())
  );
  if (faqMatch) {
    appendMessage(faqMatch.answer, "bot");
    return;
  }

  if (normalized.includes("service")) {
    appendMessage(buildServicesListText(), "bot");
    return;
  }

  if (normalized.includes("faq") || normalized.includes("question")) {
    appendMessage(buildFaqListText(), "bot");
    return;
  }

  try {
    setTyping(true);
    const llmAnswer = await fetchLLMResponse(userText);
    setTyping(false);
    appendMessage(llmAnswer, "bot");
  } catch (error) {
    setTyping(false);
    appendMessage(localKnowledgeSearch(userText), "bot");
  }
}

function bindEvents() {
  els.toggle.addEventListener("click", () => {
    const isOpen = els.window.classList.toggle("is-open");
    els.window.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) {
      els.input.focus();
    }
  });

  els.close.addEventListener("click", () => {
    els.window.classList.remove("is-open");
    els.window.setAttribute("aria-hidden", "true");
  });

  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = els.input.value.trim();
    if (!value) return;
    els.input.value = "";
    await handleUserMessage(value);
  });

  els.quickReplies.addEventListener("click", async (event) => {
    const target = event.target.closest(".quick-reply");
    if (!target) return;

    const category = target.dataset.category;
    const value = target.dataset.value;
    appendMessage(value, "user");

    if (category === "menu" && value === "services") {
      showServiceButtons();
      return;
    }

    if (category === "menu" && value === "faqs") {
      showFaqButtons();
      return;
    }

    if (category === "menu" && value === "contact") {
      showLeadCapture(true);
    }
  });

  els.body.addEventListener("click", (event) => {
    const serviceTarget = event.target.closest(".service-choice");
    if (serviceTarget) {
      const serviceName = serviceTarget.dataset.service;
      const serviceMatch = state.content.services.find(
        (service) => service.title === serviceName
      );
      appendMessage(serviceName, "user");
      if (serviceMatch) {
        appendMessage(serviceMatch.description, "bot");
        showLeadCapture();
      }
    }

    const faqTarget = event.target.closest(".faq-choice");
    if (faqTarget) {
      const faqQuestion = faqTarget.dataset.faq;
      const faqMatch = state.content.faqs.find(
        (faq) => faq.question === faqQuestion
      );
      appendMessage(faqQuestion, "user");
      if (faqMatch) {
        appendMessage(faqMatch.answer, "bot");
      }
    }
  });
}

async function initChatbot() {
  try {
    const response = await fetch(CHATBOT_CONFIG.contentUrl);
    if (!response.ok) {
      throw new Error(`Could not load ${CHATBOT_CONFIG.contentUrl}`);
    }

    state.content = await response.json();
    appendMessage(state.content.greeting, "bot");
    renderQuickReplies();
    bindEvents();
  } catch (error) {
    console.error(error);
    appendMessage(
      "Assistant content failed to load. Please check chatbot-content.json.",
      "bot"
    );
    bindEvents();
  }
}

initChatbot();
