        function toggleAbout() {
            const aboutText = document.getElementById('about-text');
            aboutText.classList.toggle('visible');
        }

        function showTab(tabId) {
            const tabs = document.querySelectorAll('.tab-pane');
            const buttons = document.querySelectorAll('.tab');

            tabs.forEach(tab => tab.classList.remove('active'));
            buttons.forEach(btn => btn.classList.remove('active'));

            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');
        }

        // Reveal sections on scroll
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                if (section.getBoundingClientRect().top < window.innerHeight - 100) {
                    section.classList.add('visible');
                }
            });
        });
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
        
            const formData = new FormData(e.target);
        
            const response = await fetch('/submit-form', {
                method: 'POST',
                body: formData
            });
        
            if (response.ok) {
                alert('Message sent successfully!');
                e.target.reset();
                fetchMessages(); // Reload messages
            } else {
                alert('Failed to send message.');
            }
        });
        
        // Fetch and display messages
        async function fetchMessages() {
            const response = await fetch('/messages');
            const messages = await response.json();
            console.log(messages); // Log messages to the console
        }
        
        fetchMessages(); // Load messages on page load
        