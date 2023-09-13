import React, { useEffect } from 'react';
import file from '../content/post_numbers.txt'

const Wrapper = () => {
  const fetchPostNumbers = async () => {
    try {
      const response = await fetch(file, { cache: 'no-cache' });
      const data = await response.text();
      const lines = data.split('\n');
      const cleanLines = lines.map(line => line.trim());
      const nonEmptyLines = cleanLines.filter(line => line !== '');

      const scripts = [];
      for (let i = 0; i < nonEmptyLines.length; i++) {
        const script = document.createElement('script');
        script.src = `https://telegram.org/js/telegram-widget.js?22`;
        script.async = true;
        script.setAttribute('data-telegram-post', `idlespot/${nonEmptyLines[i]}`);
        script.setAttribute('data-width', '100%');
        script.setAttribute('data-userpic', 'false');
        script.setAttribute('data-color', 'FF385C');

        const card = document.createElement('div');
        card.classList.add('card');
        card.appendChild(script);

        scripts.push(card);
      }

      const wrapper = document.getElementById('wrapper');
      if (wrapper) {
        while (wrapper.firstChild) {
          wrapper.removeChild(wrapper.firstChild);
        }
        scripts.forEach(element => {
          wrapper.appendChild(element);
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  };

  useEffect(() => {
    fetchPostNumbers();
  }, []);

  return <div id="wrapper"></div>;
};

export default Wrapper;