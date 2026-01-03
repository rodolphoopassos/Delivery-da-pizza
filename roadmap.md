
# 🚀 Roteiro de Montagem: PizzaFlow PWA

Este documento detalha como estruturar e escalar este projeto focado em conversão e velocidade.

## 1. Configuração do Ambiente
- **Bootstrap:** Utilize o Project IDX ou Vite para um setup rápido com React + TypeScript.
- **Styling:** Configure o Tailwind CSS. Use as diretivas no `tailwind.config.js` para garantir cores vibrantes (Orange-500/600).
- **Icons:** Use FontAwesome via CDN para feedback visual instantâneo.

## 2. Modelagem de Dados (Estratégia)
- O `JSON Schema` definido em `types.ts` separa **Flavors** de **Prices**. Isso é vital para a lógica "Meio-a-Meio", onde o preço é determinado pelo maior valor entre os sabores escolhidos para o tamanho selecionado.
- Estrutura Sugerida:
  ```json
  {
    "id": "1",
    "name": "Calabresa",
    "prices": { "P": 35, "M": 45, "G": 55, "F": 65 }
  }
  ```

## 3. Implementação da UI/UX
- **Login:** Mantenha no LocalStorage. Se `user` não existe, força o modal de Login.
- **Catálogo:** Use scroll horizontal para categorias e grid vertical para produtos.
- **Personalização:** O Modal deve carregar o estado inicial e permitir a seleção de 1 ou 2 sabores. A função `calculatePizzaPrice` deve ser reativa ao mudar o tamanho ou adicionar bordas.

## 4. Finalização e Integração
- **WhatsApp:** O backend é o próprio WhatsApp do cliente. Formate a string de texto com quebras de linha (`\n`) e emojis para facilitar a leitura por quem recebe.
- **PWA:** Adicione um `manifest.json` e configure um Service Worker (via `vite-plugin-pwa`) para permitir a instalação na home screen do celular.

## 5. Próximos Passos (Escalabilidade)
- **Firebase:** Substituir o LocalStorage por persistência no Firestore.
- **Geolocalização:** Usar a API do Google Maps para autocompletar o endereço.
- **Gemini AI:** Implementar um "Sugestor Inteligente" que recomenda bebidas com base nos sabores de pizza no carrinho.
