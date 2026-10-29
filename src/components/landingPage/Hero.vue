<template>
  <section id="topo" class="bg-[#287A4E] text-white min-[1080px]:min-h-[650px]">
    <div class="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-12 min-[720px]:grid-cols-2 min-[720px]:gap-6 min-[720px]:px-8 min-[720px]:py-14 min-[1080px]:grid-cols-[570fr_592fr] min-[1080px]:items-start min-[1080px]:gap-[70px] min-[1080px]:px-[7.22%] min-[1080px]:py-14">
      <div class="order-1 min-[1080px]:pt-4">
        <h1 class="font-display text-[42px] leading-[1.08] font-semibold tracking-tight min-[720px]:text-[clamp(42px,5vw,64px)] min-[1080px]:text-[72px] min-[1080px]:leading-[1.11]">
          Do seu campo<br />direto para a<br />prateleira.
        </h1>
        <p class="mt-7 max-w-[530px] text-base leading-7 text-white/95 min-[1080px]:mt-[50px] min-[1080px]:text-[18px]">
          O Cultiva elimina atravessadores e conecta o pequeno produtor ao varejo local através do nosso website.
        </p>
        <div class="mt-8 flex flex-col gap-3 min-[720px]:mt-10 min-[720px]:flex-row min-[720px]:flex-wrap min-[1080px]:mt-[83px]">
          <RouterLink to="/register?type=PRODUCER" class="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D6E8A7] px-7 text-[15px] font-semibold text-[#56665D] transition hover:bg-white">
            Sou Produtor
          </RouterLink>
          <RouterLink to="/register?type=RETAILER" class="inline-flex min-h-12 items-center justify-center rounded-full border border-[#DFE3D9] bg-white px-7 text-[15px] font-semibold text-[#287A4E] transition hover:bg-[#F7F5EF]">
            Sou Varejista
          </RouterLink>
        </div>
      </div>

      <div class="relative order-2 min-w-0 pt-2 min-[720px]:pt-0">
        <img
          src="/cultiva-marketplace-hero.png"
          alt="Produtor selecionando hortaliças frescas em uma banca de feira"
          class="h-[320px] w-full rounded-[18px] object-cover min-[720px]:h-[360px] min-[1080px]:h-[508px]"
        />
        <div class="relative mx-auto -mt-10 min-h-[146px] w-[min(264px,calc(100%-32px))] rounded-[18px] border border-[#DFE3D9] bg-[#D6E8A7] p-5 text-[#287A4E] min-[720px]:absolute min-[720px]:bottom-[-24px] min-[720px]:left-[-48px] min-[720px]:mx-0 min-[720px]:mt-0 min-[1080px]:bottom-[-15px] min-[1080px]:left-[-70px]">
          <h2 class="font-display text-[27px] leading-tight font-semibold">Média de preços</h2>
          <p class="mt-2 text-sm leading-[21px] text-[#56665D]">Preços otimizados com dados da plataforma</p>
        </div>
      </div>
    </div>
  </section>
</template>
