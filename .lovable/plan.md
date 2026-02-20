

# Trocar logo na tela de login

## O que muda
A imagem do logo acima do titulo "Entrar" sera substituida pela nova imagem enviada (GB Laudos Odontologicos).

## Detalhes Tecnicos

### 1. Copiar a imagem
- Copiar `user-uploads://Design_sem_nome_1.jpg` para `src/assets/gb-laudos-logo.png` (substituindo a atual)

### 2. Ajustar estilo em `src/pages/Auth.tsx`
- Aumentar o tamanho da imagem para acomodar o novo logo (que e mais largo/horizontal): de `h-14 w-14` para algo como `h-16 w-auto`
- Remover `rounded-xl` pois o novo logo nao precisa de bordas arredondadas

