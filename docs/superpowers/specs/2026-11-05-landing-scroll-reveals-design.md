# Animações de entrada na landing — design

- **Intenção:** dar feedback visual discreto enquanto a pessoa percorre a landing, revelando cada item quando ele entra na área visível.
- **Escopo:** animar títulos, blocos de conteúdo e cards; nunca animar o contêiner de uma seção inteira. Itens em sequência podem ter pequeno atraso entre si. Cada item anima apenas na primeira entrada.
- **Abordagens:** revelar seções inteiras seria mais simples, mas não atende ao pedido. Uma biblioteca de animação adicionaria dependência sem necessidade. A abordagem escolhida usa `IntersectionObserver` nativo e estilos locais, com opacidade e deslocamento curto.
- **Acessibilidade e limites:** respeitar `prefers-reduced-motion`; deixar conteúdo visível quando movimento reduzido estiver ativo ou `IntersectionObserver` não estiver disponível. Não alterar conteúdo, layout ou rolagem Lenis.
- **Implementação:** marcar os itens de conteúdo nas seções da landing, observar sua entrada e aplicar a classe de revelação; estilos e tempos ficam em `src/style.css`. Desconectar o observer ao desmontar a landing.
