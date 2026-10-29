<template>
  <section id="problema" class="bg-[#F7F5EF] py-16 min-[720px]:py-20 min-[1080px]:min-h-[900px] min-[1080px]:py-16">
    <div class="mx-auto max-w-[1440px] px-6 min-[720px]:px-8 min-[1080px]:px-[7.22%]">
      <div class="max-w-[1100px]">
        <p class="mb-5 text-xs font-semibold tracking-[1.4px] text-[#287A4E]">O DESAFIO ATUAL</p>
        <h2 class="font-display text-4xl leading-tight font-semibold text-[#287A4E] min-[1080px]:text-5xl">
          O mercado ainda funciona de forma desigual.
        </h2>
        <div class="mt-6 max-w-[1100px] space-y-3 text-[15px] leading-[27px] text-[#56665D] min-[1080px]:text-[17px]">
          <p>Enquanto pequenos produtores enfrentam dificuldades para alcançar novos compradores, varejistas dependem de poucos fornecedores para abastecer seus negócios.</p>
          <p>A falta de conexão entre oferta e demanda gera desperdícios, reduz margens e limita oportunidades para ambos os lados.</p>
        </div>
      </div>

      <div class="mt-10 grid gap-5 min-[720px]:grid-cols-2 min-[1080px]:mt-14 min-[1080px]:gap-16">
        <article class="landing-card rounded-[20px] border border-[#DFE3D9] bg-white p-6 min-[1080px]:min-h-[444px] min-[1080px]:p-7">
          <h3 class="font-display text-[25px] leading-8 font-semibold text-[#287A4E]">Pequeno Produtor</h3>
          <div class="mt-8 divide-y divide-[#DFE3D9]">
            <div class="py-4 first:pt-0">
              <h4 class="flex items-center gap-3 text-[17px] font-medium text-[#287A4E]"><span class="h-2 w-2 shrink-0 rounded-full bg-[#2CA961]"></span>Baixa Visibilidade</h4>
              <p class="ml-5 mt-1 text-[15px] leading-[22px] text-[#56665D]">Dificuldade para encontrar novos compradores além da sua região.</p>
            </div>
            <div class="py-4">
              <h4 class="flex items-center gap-3 text-[17px] font-medium text-[#287A4E]"><span class="h-2 w-2 shrink-0 rounded-full bg-[#2CA961]"></span>Dependência de Intermediários</h4>
              <p class="ml-5 mt-1 text-[15px] leading-[22px] text-[#56665D]">Parte significativa do lucro fica ao longo da cadeia de distribuição.</p>
            </div>
            <div class="py-4 last:pb-0">
              <h4 class="flex items-center gap-3 text-[17px] font-medium text-[#287A4E]"><span class="h-2 w-2 shrink-0 rounded-full bg-[#2CA961]"></span>Falta de Previsibilidade</h4>
              <p class="ml-5 mt-1 text-[15px] leading-[22px] text-[#56665D]">Incerteza sobre demanda futura, preços e escoamento da produção.</p>
            </div>
          </div>
        </article>

        <article class="landing-card rounded-[20px] border border-[#DFE3D9] bg-white p-6 min-[1080px]:min-h-[444px] min-[1080px]:p-7">
          <h3 class="font-display text-[25px] leading-8 font-semibold text-[#287A4E]">Varejista</h3>
          <div class="mt-8 divide-y divide-[#DFE3D9]">
            <div class="py-4 first:pt-0">
              <h4 class="flex items-center gap-3 text-[17px] font-medium text-[#287A4E]"><span class="h-2 w-2 shrink-0 rounded-full bg-[#2CA961]"></span>Poucas Opções de Fornecedores</h4>
              <p class="ml-5 mt-1 text-[15px] leading-[22px] text-[#56665D]">Dependência excessiva de grandes distribuidores.</p>
            </div>
            <div class="py-4">
              <h4 class="flex items-center gap-3 text-[17px] font-medium text-[#287A4E]"><span class="h-2 w-2 shrink-0 rounded-full bg-[#2CA961]"></span>Custos Elevados</h4>
              <p class="ml-5 mt-1 text-[15px] leading-[22px] text-[#56665D]">Preços impactados por múltiplos intermediários.</p>
            </div>
            <div class="py-4 last:pb-0">
              <h4 class="flex items-center gap-3 text-[17px] font-medium text-[#287A4E]"><span class="h-2 w-2 shrink-0 rounded-full bg-[#2CA961]"></span>Dificuldade de Encontrar Produtores Locais</h4>
              <p class="ml-5 mt-1 text-[15px] leading-[22px] text-[#56665D]">Falta de acesso a fornecedores próximos e qualificados.</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
