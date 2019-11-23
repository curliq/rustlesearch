<template>
  <div
    class="bg-gray-850 rounded-sm shadow flex flex-col rounded-sm py-4 px-3 text-gray-400"
  >
    <div class="flex flex-col mb-5">
      <base-dark-label class="text-lg mr-2 flex-initial mb-2">
        Info
      </base-dark-label>
      <p class="mb-2">
        Rustlesearch enables searching of over 4.8 billion twitch messages with
        advanced filtering features.
      </p>
      <p class="mb-1">
        Here are the advanced query operators for the username and text fields:
      </p>
      <ul class="list-inside list-disc font-mono text-sm">
        <li class="mb-2">
          <span class="bg-gray-950 px-1">|</span>
          OR operator.
          <br />
          Ex:
          <span class="bg-gray-950 px-1"
            >destiny | trainwreckstv | pokimane</span
          >
        </li>
        <li class="mb-2">
          <span class="bg-gray-950 px-1 font-mono">+</span>
          AND operator.
          <br />
          Ex:
          <span class="bg-gray-950 px-1">destiny + pepelaugh</span>
        </li>
        <li class="mb-2">
          <span class="bg-gray-950 px-1 font-mono">""</span>
          Exact phrase search.
          <br />
          Ex:
          <span class="bg-gray-950 px-1">"I like books" | "Nice lol"</span>
        </li>
        <li class="mb-2">
          <span class="bg-gray-950 px-1 font-mono">-</span>
          Negation operator.
          <br />
          Ex:
          <span class="bg-gray-950 px-1">pepelaugh | lulw -kekw</span>
          <br />
          Match pepelaugh OR lulw but NOT kekw
        </li>
        <li class="mb-2">
          <span class="bg-gray-950 px-1 font-mono">()</span>
          Precedence operator.
          <br />
          Ex:
          <span class="bg-gray-950 px-1"
            >(pepelaugh + lulw) | (kekw + omegalul)</span
          >
          <br />
          Match (pepelaugh with lulw) OR (kekw with omegalul)
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped></style>
