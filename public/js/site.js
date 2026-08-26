/* Shared USMail.ai site behavior */
;(function () {
  const y = document.getElementById('y')
  if (y) y.textContent = String(new Date().getFullYear())

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons()
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIcons)
  } else {
    initIcons()
  }
  window.addEventListener('load', initIcons)

  // Mobile nav
  const navToggle = document.getElementById('nav-toggle')
  const primaryNav = document.getElementById('primary-nav')
  if (navToggle && primaryNav) {
    const setOpen = (open) => {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu')
      primaryNav.classList.toggle('is-open', open)
      document.body.classList.toggle('nav-open', open)
    }
    navToggle.addEventListener('click', () => {
      setOpen(navToggle.getAttribute('aria-expanded') !== 'true')
    })
    primaryNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false))
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false)
        navToggle.focus()
      }
    })
  }

  // Mark active nav link
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/'
  document.querySelectorAll('.nav-links a[href], .footer-nav a[href]').forEach((a) => {
    try {
      const href = a.getAttribute('href') || ''
      if (!href.startsWith('/') || href.startsWith('/#')) return
      const clean = href.split('?')[0].replace(/\/$/, '') || '/'
      const industriesChild =
        clean === '/industries' && path.startsWith('/industries/')
      if (clean === path || (path === '/' && clean === '') || industriesChild) {
        a.setAttribute('aria-current', 'page')
        a.classList.add('is-active')
      }
    } catch {
      /* ignore */
    }
  })

  // Contact form (home + /contact). Same waitlist endpoint still accepted server-side.
  const params = new URLSearchParams(window.location.search)
  const form = document.getElementById('contact-form') || document.getElementById('early-access-form')
  const topicSelect = form && form.querySelector('select[name="topic"], select[name="interest"]')
  const allowed = new Set(['question', 'demo', 'volume', 'certified', 'mcp', 'other'])
  const topicAliases = {
    interest: 'question',
    business: 'volume',
    individual: 'question',
    bank: 'volume',
    banks: 'volume',
    gov: 'volume',
    government: 'volume',
    'city-county': 'volume',
    'credit-repair': 'volume',
    'debt-collection': 'volume',
    healthcare: 'volume',
    storage: 'volume',
    utilities: 'volume',
    ai: 'mcp',
    agent: 'mcp',
    'early-access': 'demo',
  }
  function setTopic(v) {
    if (!topicSelect || !v) return
    const raw = String(v).toLowerCase().trim()
    const key = topicAliases[raw] || raw
    if (!allowed.has(key)) return
    topicSelect.value = key
  }
  setTopic((params.get('topic') || params.get('interest') || '').toLowerCase())
  document.querySelectorAll('[data-interest], [data-topic]').forEach((el) => {
    el.addEventListener('click', () =>
      setTopic(el.getAttribute('data-topic') || el.getAttribute('data-interest') || ''),
    )
  })

  ;['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => {
    const el = form && form.querySelector(`[name="${k}"]`)
    if (el && params.get(k)) el.value = params.get(k)
  })

  const statusEl = document.getElementById('contact-status') || document.getElementById('early-access-status')
  const submitBtn = document.getElementById('contact-submit') || document.getElementById('early-access-submit')
  if (form && statusEl && submitBtn) {
    const emailInput = form.querySelector('input[name="email"]')
    const messageInput = form.querySelector('textarea[name="message"]')
    const defaultSubmit = submitBtn.textContent || 'Send message'
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      statusEl.textContent = ''
      statusEl.className = 'form-status'
      if (emailInput) {
        emailInput.removeAttribute('aria-invalid')
        emailInput.removeAttribute('aria-describedby')
      }
      if (messageInput) {
        messageInput.removeAttribute('aria-invalid')
        messageInput.removeAttribute('aria-describedby')
      }
      const fd = new FormData(form)
      const email = String(fd.get('email') || '').trim()
      const message = String(fd.get('message') || '').trim()
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.textContent = 'Enter a valid email address.'
        statusEl.classList.add('is-error')
        if (emailInput) {
          emailInput.setAttribute('aria-invalid', 'true')
          emailInput.setAttribute('aria-describedby', statusEl.id)
          emailInput.focus()
        }
        return
      }
      if (messageInput && !message) {
        statusEl.textContent = 'Write a short message.'
        statusEl.classList.add('is-error')
        messageInput.setAttribute('aria-invalid', 'true')
        messageInput.setAttribute('aria-describedby', statusEl.id)
        messageInput.focus()
        return
      }
      submitBtn.disabled = true
      submitBtn.textContent = 'Sending…'
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: String(fd.get('name') || '').trim(),
            topic: String(fd.get('topic') || fd.get('interest') || '').trim(),
            message,
            company_website: String(fd.get('company_website') || ''),
            utm_source: String(fd.get('utm_source') || '').trim(),
            utm_medium: String(fd.get('utm_medium') || '').trim(),
            utm_campaign: String(fd.get('utm_campaign') || '').trim(),
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.ok) throw new Error(data.error || 'failed')
        statusEl.textContent = 'We received your message. We’ll reply.'
        statusEl.classList.add('is-success')
        form.reset()
        setTopic((params.get('topic') || params.get('interest') || '').toLowerCase())
      } catch {
        statusEl.innerHTML =
          'Couldn’t submit — email <a href="mailto:info@usmail.ai">info@usmail.ai</a> or call 888-667-5322.'
        statusEl.classList.add('is-error')
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = defaultSubmit
      }
    })
  }
})()
