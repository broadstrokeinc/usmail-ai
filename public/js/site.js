/* Shared USMail.AI site behavior */
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
  }

  // Mark active nav link
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/'
  document.querySelectorAll('.nav-links a[href], .footer-nav a[href]').forEach((a) => {
    try {
      const href = a.getAttribute('href') || ''
      if (!href.startsWith('/') || href.startsWith('/#')) return
      const clean = href.split('?')[0].replace(/\/$/, '') || '/'
      if (clean === path || (path === '/' && clean === '')) {
        a.setAttribute('aria-current', 'page')
        a.classList.add('is-active')
      }
    } catch {
      /* ignore */
    }
  })

  // Early-access form (home only)
  const params = new URLSearchParams(window.location.search)
  const interestSelect = document.querySelector('#early-access-form select[name="interest"]')
  const allowed = new Set(['individual', 'business', 'mcp', 'certified', 'demo'])
  function setInterest(v) {
    if (!interestSelect || !allowed.has(v)) return
    interestSelect.value = v
  }
  setInterest((params.get('interest') || '').toLowerCase())
  document.querySelectorAll('[data-interest]').forEach((el) => {
    el.addEventListener('click', () => setInterest(el.getAttribute('data-interest') || ''))
  })

  ;['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => {
    const el = document.getElementById(k)
    if (el && params.get(k)) el.value = params.get(k)
  })

  const form = document.getElementById('early-access-form')
  const statusEl = document.getElementById('early-access-status')
  const submitBtn = document.getElementById('early-access-submit')
  if (form && statusEl && submitBtn) {
    const emailInput = form.querySelector('input[name="email"]')
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      statusEl.textContent = ''
      statusEl.className = 'form-status'
      if (emailInput) {
        emailInput.removeAttribute('aria-invalid')
        emailInput.removeAttribute('aria-describedby')
      }
      const fd = new FormData(form)
      const email = String(fd.get('email') || '').trim()
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.textContent = 'Enter a valid email address.'
        statusEl.classList.add('is-error')
        if (emailInput) {
          emailInput.setAttribute('aria-invalid', 'true')
          emailInput.setAttribute('aria-describedby', 'early-access-status')
          emailInput.focus()
        }
        return
      }
      submitBtn.disabled = true
      submitBtn.textContent = 'Sending…'
      try {
        const res = await fetch('/api/early-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: String(fd.get('name') || '').trim(),
            interest: String(fd.get('interest') || '').trim(),
            company_website: String(fd.get('company_website') || ''),
            utm_source: String(fd.get('utm_source') || '').trim(),
            utm_medium: String(fd.get('utm_medium') || '').trim(),
            utm_campaign: String(fd.get('utm_campaign') || '').trim(),
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.ok) throw new Error(data.error || 'failed')
        statusEl.textContent = 'You’re on the list. We’ll be in touch.'
        statusEl.classList.add('is-success')
        form.reset()
        setInterest((params.get('interest') || '').toLowerCase())
      } catch {
        statusEl.innerHTML =
          'Couldn’t submit — email <a href="mailto:Info@USMAIL.ai">Info@USMAIL.ai</a> or call us.'
        statusEl.classList.add('is-error')
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = 'Join waitlist'
      }
    })
  }
})()
