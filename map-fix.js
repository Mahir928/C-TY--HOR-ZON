(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.dataset.ready === '1') return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Failed to load: ' + src)), { once: true });
        return;
      }

      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => {
        s.dataset.ready = '1';
        resolve();
      };
      s.onerror = () => reject(new Error('Failed to load: ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureMapLoader() {
    if (!window.THREE) {
      console.warn('Map fix: THREE.js not found. Make sure the Three.js script is loaded before this file.');
      return;
    }

    if (!window.THREE.FBXLoader) {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js');
      } catch (err) {
        console.error('Map fix: FBXLoader could not be loaded.', err);
        return;
      }
    }

    if (!window.THREE.FBXLoader) {
      console.error('Map fix: FBXLoader is still unavailable after loading attempt.');
      return;
    }

    const scene = window.scene || document.querySelector('canvas') && window.scene;
    if (!scene) {
      console.warn('Map fix: window.scene not found yet. Waiting for the game scene to be created...');
      return;
    }

    const loader = new THREE.FBXLoader();
    const url = './wiz1etap/wiz1etap.fbx';

    loader.load(
      url,
      function (object) {
        object.name = 'wiz1etap_map';
        object.traverse(function (child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Keep model scale consistent with the rest of the scene.
        object.scale.setScalar(1);
        object.position.set(0, 0, 0);
        scene.add(object);

        console.log('Map fix: loaded', url);
        window.wiz1etapMap = object;
      },
      function (xhr) {
        if (xhr.total) {
          const pct = (xhr.loaded / xhr.total) * 100;
          console.log('Map fix: loading ' + pct.toFixed(1) + '%');
        }
      },
      function (error) {
        console.error('Map fix: failed to load wiz1etap.fbx', error);
      }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureMapLoader, { once: true });
  } else {
    ensureMapLoader();
  }
})();
