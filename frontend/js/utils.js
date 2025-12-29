// Helper functions
const Utils = {
  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Show toast notification
  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  },

  // Create toast container
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  },

  // Show loading spinner
  showLoading(element) {
    if (element) {
      element.disabled = true;
      element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
    }
  },

  // Hide loading spinner
  hideLoading(element, originalText) {
    if (element) {
      element.disabled = false;
      element.innerHTML = originalText;
    }
  },

  // Show error in form
  showFormError(formId, message) {
    const form = document.getElementById(formId);
    if (form) {
      let errorDiv = form.querySelector('.form-error');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger form-error';
        form.insertBefore(errorDiv, form.firstChild);
      }
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  },

  // Hide form error
  hideFormError(formId) {
    const form = document.getElementById(formId);
    if (form) {
      const errorDiv = form.querySelector('.form-error');
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    }
  },

  // Confirm dialog
  async confirm(message) {
    return new Promise((resolve) => {
      if (window.confirm(message)) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Get query parameter
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Truncate text
  truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.substr(0, length) + '...';
  },

  // Get badge class for role
  getRoleBadgeClass(role) {
    const badges = {
      admin: 'bg-danger',
      faculty: 'bg-primary',
      student: 'bg-success'
    };
    return badges[role] || 'bg-secondary';
  },

  // Get badge class for notice type
  getNoticeTypeBadgeClass(type) {
    const badges = {
      ALL: 'bg-info',
      FACULTY: 'bg-warning',
      CLASS: 'bg-primary'
    };
    return badges[type] || 'bg-secondary';
  },

  // Validate email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate password
  isValidPassword(password) {
    return password.length >= 6 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  },

  // Escape HTML
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  // Format notice type
  formatNoticeType(type) {
    const types = {
      'ALL': 'All Users',
      'FACULTY': 'Faculty Only',
      'CLASS': 'Specific Class'
    };
    return types[type] || type;
  },

  // Format role
  formatRole(role) {
    const roles = {
      'admin': 'Administrator',
      'faculty': 'Faculty Member',
      'student': 'Student'
    };
    return roles[role] || role;
  },

  // Get notice type badge
  getNoticeTypeBadge(type) {
    const badges = {
      'ALL': 'primary',
      'FACULTY': 'success',
      'CLASS': 'warning'
    };
    return badges[type] || 'secondary';
  },

  // Get role badge
  getRoleBadge(role) {
    const badges = {
      'admin': 'danger',
      'faculty': 'info',
      'student': 'secondary'
    };
    return badges[role] || 'secondary';
  },

  // Show loading spinner (global)
  showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = 'block';
    }
  },

  // Hide loading spinner (global)
  hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = 'none';
    }
  },

  // Confirm action
  confirmAction(message) {
    return confirm(message);
  },

  // Truncate text (alias for truncate)
  truncateText(text, maxLength = 50) {
    return this.truncate(text, maxLength);
  },

  // Show toast with title
  showToast(message, type = 'info', title = 'Notification') {
    const toastEl = document.getElementById('liveToast');
    if (toastEl) {
      const toastTitle = document.getElementById('toastTitle');
      const toastMessage = document.getElementById('toastMessage');
      
      toastTitle.textContent = title;
      toastMessage.textContent = message;
      
      // Update toast class based on type
      toastEl.className = `toast bg-${type} text-white`;
      
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    } else {
      // Fallback to the existing toast method
      this.showToast(message, type);
    }
  }
};