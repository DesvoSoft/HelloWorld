// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Texto plano de un nodo hast, para reutilizar encabezados como etiqueta. */
/** @param {any} node @returns {string} */
function textOf(node) {
	if (node.type === 'text') return node.value;
	if (!node.children) return '';
	return node.children.map(textOf).join('');
}

/**
 * Envuelve cada <table> de markdown en un contenedor con scroll horizontal.
 * Las tablas de java median 359px dentro de un viewport de 320, y eran el unico
 * desbordamiento horizontal real que quedaba en el sitio.
 *
 * El wrapper es focusable y tiene nombre porque un area con scroll a la que
 * solo se llega arrastrando deja fuera a quien navega con teclado (WCAG 2.1.1).
 *
 * El nombre sale del encabezado anterior en vez de ser fijo: java tiene tres
 * tablas y con una etiqueta repetida el lector de pantalla anuncia tres
 * regiones indistinguibles. Si dos tablas cuelgan del mismo encabezado se
 * desempata con un ordinal.
 */
function rehypeWrapTables() {
	/** @param {any} tree */
	return (tree) => {
		let heading = '';
		/** @type {Map<string, number>} */
		const used = new Map();
		/** @param {any} node */
		const walk = (node) => {
			if (!node.children) return;
			node.children = node.children.map((/** @type {any} */ child) => {
				if (child.type === 'element' && /^h[1-6]$/.test(child.tagName)) {
					heading = textOf(child).trim();
				}
				walk(child);
				if (child.type !== 'element' || child.tagName !== 'table') return child;
				let label = heading ? `Tabla: ${heading}` : 'Tabla';
				const seen = (used.get(label) || 0) + 1;
				used.set(label, seen);
				if (seen > 1) label = `${label} (${seen})`;
				return {
					type: 'element',
					tagName: 'div',
					properties: {
						className: ['table-scroll'],
						tabIndex: 0,
						role: 'region',
						'aria-label': label,
					},
					children: [child],
				};
			});
		};
		walk(tree);
		return tree;
	};
}

/**
 * github-dark pinta los comentarios en #6a737d sobre #24292e: 3.04:1, por
 * debajo del 4.5:1 que pide WCAG AA. Fallaba en las cuatro paginas de docs, no
 * solo en java. Se sube a #8b949e (el gris de comentarios de github-dark-default),
 * que da 5.9:1 sobre el mismo fondo y mantiene el aspecto del tema.
 */
/** @type {Record<string, string>} */
const CONTRAST_REMAP = { '#6a737d': '#8b949e' };

/** @type {import('shiki').ShikiTransformer} */
const fixCommentContrast = {
	name: 'contrast-aa',
	tokens(lines) {
		for (const line of lines) {
			for (const token of line) {
				const next = token.color && CONTRAST_REMAP[token.color.toLowerCase()];
				if (next) token.color = next;
			}
		}
	},
};

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://desvosoft.github.io',
  base: '/HelloWorld/',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  markdown: {
    rehypePlugins: [rehypeWrapTables],
    shikiConfig: {
      theme: 'github-dark',
      transformers: [fixCommentContrast],
    },
  },
  integrations: [sitemap()]
});
