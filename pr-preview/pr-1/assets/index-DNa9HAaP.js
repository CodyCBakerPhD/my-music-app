(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new Set([`Primary`]),t=`, `;function n(e,n){return n.map(n=>{let r=n.tags===void 0||n.tags===null?[]:String(n.tags).split(t),i={name:String(n.name),tags:[e,...r],source:e};return n.url!==void 0&&(i.url=String(n.url)),n.creators!==void 0&&(i.creators=String(n.creators)),n.notes!==void 0&&(i.notes=String(n.notes)),i})}function r(e,t){let n=[],r=[],i=a=>{if(r.length===t){n.push(r.map(t=>e[t]));return}for(let t=a;t<e.length;t++)r.push(t),i(t+1),r.pop()};return i(0),n}function i(e,n=2){let i=new Set;for(let a=1;a<=n;a++)for(let n of r(e,a))i.add(n.join(t));return[...i]}function a(e){let t=new Map;for(let n of e)for(let e of i(n.tags)){let r=t.get(e);r===void 0?t.set(e,[n.name]):r.push(n.name)}return t}function o(e,t){if(e.size!==t.size)return!1;for(let n of e)if(!t.has(n))return!1;return!0}function s(t,n=2,r=e){let i=new Map([...t].filter(([,e])=>e.length>n)),a=new Map([...i].map(([e,t])=>[e,new Set(t)])),s=new Set(r),c=new Map,l=[...i.keys()].sort((e,t)=>e.length-t.length||(e<t?-1:+(e>t)));for(let e of l){if(s.has(e))continue;let t=a.get(e);for(let[n,r]of a)n===e||s.has(n)||o(t,r)&&s.add(n);c.set(e,i.get(e))}return c}function c(e,t=new Map){let n=s(a(e)),r=[];for(let[e,i]of n){let n=t.get(e);r.push({name:e,songs:n??i,manual:n!==void 0})}return r}function l(e,t=()=>`wav`){return e.songs.map(e=>`${e}.${t(e)}`).join(`
`)}var u=44,d=2;function f(e,t,n){for(let r=0;r<n.length;r++)e.setUint8(t+r,n.charCodeAt(r))}function p(e){let t=Math.max(-1,Math.min(1,e));return Math.round(t<0?t*32768:t*32767)}function m(e){let t=e.numberOfChannels,n=t*d,r=e.length*n,i=new ArrayBuffer(u+r),a=new DataView(i);f(a,0,`RIFF`),a.setUint32(4,36+r,!0),f(a,8,`WAVE`),f(a,12,`fmt `),a.setUint32(16,16,!0),a.setUint16(20,1,!0),a.setUint16(22,t,!0),a.setUint32(24,e.sampleRate,!0),a.setUint32(28,e.sampleRate*n,!0),a.setUint16(32,n,!0),a.setUint16(34,16,!0),f(a,36,`data`),a.setUint32(40,r,!0);let o=Array.from({length:t},(t,n)=>e.getChannelData(n)),s=u;for(let n=0;n<e.length;n++)for(let e=0;e<t;e++)a.setInt16(s,p(o[e][n]),!0),s+=d;return new Uint8Array(i)}function h(e){let t=e.lastIndexOf(`.`);return t<=0?{stem:e,extension:``}:{stem:e.slice(0,t),extension:e.slice(t+1)}}function g(e){let t=e.split(`/`).filter(e=>e.length>0),n=t.findIndex(e=>e===`source`||e===`modified`);return n===-1?t:t.slice(n)}function _(e){let t={source:new Map,modified:new Map,ignored:[]};for(let n of e){let e=g(n.path),r=e[e.length-1]??``,i=r.startsWith(`.`);e.length===2&&!i&&(e[0]===`source`||e[0]===`modified`)?t[e[0]].set(h(r).stem,n):t.ignored.push(n)}return t}function v(e,t){let n=new Set(t.songs.map(e=>e.name));return{missingFromSource:[...n].filter(t=>!e.source.has(t)),notInMetadata:[...e.source.keys()].filter(e=>!n.has(e)),orphanedModified:[...e.modified.keys()].filter(t=>!e.source.has(t))}}var y=async e=>new OfflineAudioContext(2,1,44100).decodeAudioData(await e.arrayBuffer());async function b(e,t,n){let r=0;await Promise.all(Array.from({length:Math.max(1,Math.min(t,e.length))},async()=>{for(;r<e.length;){let t=e[r++];await n(t)}}))}async function x(e,t,n,{decoder:r=y,concurrency:i=2,onProgress:a}={}){if(e.source.size===0)throw Error(`No original songs found in the 'source' folder.`);await n.begin();let o={converted:[],copied:[],errors:[],playlistsWritten:[],playlistsIncomplete:new Map,countMismatch:null},s=new Set,c=[...e.source.entries()],u=0;a?.({done:u,total:c.length,current:``}),await b(c,i,async([t,i])=>{try{let a=e.modified.get(t);a===void 0?(await n.write(`vlc/${t}.wav`,m(await r(i.file))),o.converted.push(t)):(await n.write(`vlc/${t}.wav`,new Uint8Array(await a.file.arrayBuffer())),o.copied.push(t)),s.add(t)}catch(e){let r=e instanceof Error?`${e.name}: ${e.message}`:String(e),i=e instanceof Error&&e.stack?`\n\n${e.stack}`:``;o.errors.push({song:t,message:r}),await n.write(`logs/${t}_error.log`,r+i)}u+=1,a?.({done:u,total:c.length,current:t})});for(let e of t.playlists){let t=e.songs.filter(e=>!s.has(e));if(t.length>0){o.playlistsIncomplete.set(e.name,t);continue}await n.write(`vlc/${e.name}.m3u`,l(e)),o.playlistsWritten.push(e.name)}return s.size!==e.source.size&&(o.countMismatch={pre:e.source.size,post:s.size}),await n.finish(),o}var ee=`- name: Dark, Twisted and Cruel
  tags: Workout, Games
  url: https://www.youtube.com/watch?v=KeFnW61d8lc
  creators: Paleface

- name: Wide Awake
  tags: Games
  url: https://www.youtube.com/watch?v=RLZ7peL-j_U
  creators: Jaimes

- name: The Poet and the Muse
  tags: Games
  url: https://www.youtube.com/watch?v=GLxb7m0j5Jg
  creators: Old Gods of Asgard

- name: Follow You Into The Dark
  tags: Games
  url: https://www.youtube.com/watch?v=I00GkC8feDU
  creators: RAKEL
`,S=`- name: Near
  tags: Deathnote
  url: https://www.youtube.com/watch?v=IwgICbILJ9o
  creators: CJ Music

- name: L x Light
  tags: Deathnote
  url: https://www.youtube.com/watch?v=EJ9Ohx3z2sw
  creators: CJ Music

- name: Golden Time Lover
  tags: Full Metal Alchemist
  url: https://www.youtube.com/watch?v=nrjVPZP1JIw
  creators: Studio Yuraki

- name: Period
  tags: Full Metal Alchemist
  url: https://www.youtube.com/watch?v=OcEPi99RcA4
  creators: Studio Yuraki

- name: Again
  tags: Full Metal Alchemist
  url: https://www.youtube.com/watch?v=IE1jTr-4U-E
  creators: Studio Yuraki

- name: Inochi no Namae
  tags: Ghibli, Spirited Away
  url: https://www.youtube.com/watch?v=U9RxGijXy4g
  creators: Joe Hisaishi

- name: Rivers in the Desert
  tags: Persona 5
  url: https://www.youtube.com/watch?v=lvuHvXsZPrk
  creators: ""

- name: Guess Who Is Back
  tags: Black Clover
  url: https://www.youtube.com/watch?v=mggfo-WkpQQ
  creators: AmaLee
  notes: "TODO: clip start"

- name: Gurenge (Metal)
  tags: Demon Slayer
  url: https://www.youtube.com/watch?v=cZXtDIkFYUY
  creators: Jonathan Young, Miami Dolphin

- name: Gurenge (Alternate)
  tags: Demon Slayer
  url: https://www.youtube.com/watch?v=KqRl5OAFYCQ
  creators: MattyyyM, Rainych, Shayne Orok, Fonzi M, Drumstick, Rufus Mann

- name: Legends Never Die
  tags: League of Legends
  url: https://www.youtube.com/watch?v=r6zIGXun57U
  creators: Against the Current

- name: A Cruel Angel's Thesis
  tags: Neon Genesis
  url: https://www.youtube.com/watch?v=mAt7E6t5lkg
  creators: Rachie
  notes: "TODO: clip start"

- name: Island Song
  tags: Adventure Time
  url: https://www.youtube.com/watch?v=xXQNdUpCQzw
  creators: Ashley Eriksson

- name: Falling Up
  tags: Workout
  creators: Stray Kids

- name: BELIEVE
  tags: Workout
  creators: NiziU

- name: Abyss
  tags: Workout
  creators: YUNGBLUD
`,C=`# It goes without saying that Hiroyuki Sawano is the genius deserving of all credit for the amazing OST quality overall.
# The vast majority of all songs were originally created by their team.
# Other performers throughout these lists perfected the work in only minor ways.
# A mix of the classic official soundtrack and remasters or English covers by YouTubers.
# TODO: might be able to get the high-quality WAV versions
# from Sam Kim via Patreon: https://www.patreon.com/samuelkimmusic

- name: Vogel im Kafig
  tags: Trailer
  url: https://www.youtube.com/watch?v=JhneYvEsxdQ
  creators: Hiroyuki Sawano
  notes: The original, slowed with reverb.

- name: Titan Invasion
  tags: Primary
  url: https://www.youtube.com/watch?v=9xYHA2jtOeE
  creators: Jenny
  notes: |
      Renamed from "attack ON titan" (with special characters); potential naming conflict with another song named
      "Titan Invasion".

- name: Eye Water (Guitar)
  tags: Primary, Guitar, Emotional
  url: https://www.youtube.com/watch?v=w9nRnka-c6Y
  creators: Hiroyuki Sawano

- name: Three-Dimensional Maneuver
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=pX0uMt5I51k
  creators: Hiroyuki Sawano

- name: Reluctant Heroes
  tags: Primary, Workout
  url: https://www.youtube.com/watch?v=9C19C6H9_Ug
  creators: NateWantsToBattle

- name: Counterattack
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=w5Bi5YtvJFA
  creators: Hiroyuki Sawano
  notes: "TODO: Need to clip in half"

- name: Guren no Yumiya
  tags: Primary
  url: https://www.youtube.com/watch?v=aFcfgHfEEsw
  creators: NateWantsToBattle

- name: XL-TT
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=6tMhkQ520Sk
  creators: Hiroyuki Sawano
  notes: "TODO: could probably clip first few seconds"

- name: EMA
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=CaiIEGKGh_c
  creators: Hiroyuki Sawano

- name: Building Blocks
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=B4SpqsRLPHc
  creators: Hiroyuki Sawano

- name: Female Titan
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=0Vs2beUh3k8
  creators: Hiroyuki Sawano

- name: Berserk
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=LmPH8BTwPKU
  creators: Hiroyuki Sawano

- name: Calling Out Your Name
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=hBdWb34RKwc
  creators: Hiroyuki Sawano
  notes: This is the Lost Girls version, which is superior to the classic.

- name: Shinzou wo Sasageyo
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=bvTtZhFnI6E
  creators: Linked Horizon
  notes: |
      It's strangely difficult to find this mid-length version.
      The full version by Linked Horizon is ridiculously long and gets stale in the middle.
      Most versions are < 1:30.

- name: Eye Water
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=GxqirT3mt_U
  creators: Hiroyuki Sawano

- name: Call of Silence
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=jsUqStV7V-w
  creators: Hiroyuki Sawano

- name: Identity
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=Lccq_W--Dh8
  creators: Hiroyuki Sawano
  notes: "TODO: clip into separate songs?"

- name: Power of Command
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=6LEn3ysKb8Q
  creators: Hiroyuki Sawano
  notes: "TODO: need to clip only most relevant inner section, possibly split into separate songs..."

- name: Retreat
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=8LBDcocrt-Q
  creators: Hiroyuki Sawano
  notes: "TODO: clip/reduce down to relevant part?"

- name: Red Swan
  tags: Primary
  url: https://www.youtube.com/watch?v=r1XE8ON8fos
  creators: Yoshiki, Hyde

- name: Ackermann
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=36xEVAg3Eis
  creators: Hiroyuki Sawano

- name: Zero Eclipse
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=TH4V94gBoXA
  creators: Hiroyuki Sawano

- name: Barricades (Orchestral)
  tags: Primary, Orchestral
  url: https://www.youtube.com/watch?v=8yfXFFki6Y8
  creators: Kyokuro
  notes: This one is hard to find, there are so many different remixes of Barricades...

- name: Counterattack (Guitar)
  tags: Primary, Guitar
  url: https://www.youtube.com/watch?v=YEjFCdmuiq8
  creators: Mica Caldito
  notes: "TODO: clip DOA into a separate song"

- name: Beautiful Cruel World
  tags: Primary
  url: https://www.youtube.com/watch?v=zRq2Wcu1h6U
  creators: AmaLee
  notes: "TODO: needs clipping at the start"

- name: Apple Seed
  tags: Primary, Original, Workout
  url: https://www.youtube.com/watch?v=Tgli1xUKX5s
  creators: Hiroyuki Sawano

- name: Death
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=IoAOvpK8ZK0
  creators: Hiroyuki Sawano
  notes: "TODO: needs clipping at the end"

- name: My War (Ending)
  tags: Primary
  url: https://www.youtube.com/watch?v=TjP84y6_IMg
  creators: Jenny
  notes: |
      Best English cover for the middle theme, though not the absolute best vocals possible.
      The haunting start is not quite as good as PelleK but the rest of the vocals (but not the track) is much better.

- name: Call Your Heroes
  tags: Trailer
  url: https://www.youtube.com/watch?v=A5A1uAd2J9c
  creators: AmaLee
  notes: Custom mix of multiple themes.

- name: Barricades (Trailer)
  tags: Trailer
  url: https://www.youtube.com/watch?v=tRjXmWNUsK8
  creators: Samuel Kim

- name: The Rumbling (Emotional)
  tags: Trailer, Emotional
  url: https://www.youtube.com/watch?v=ZzKRmTVPZ94
  creators: Amy B
  notes: Most emotional version of this one.

- name: Ashes on the Fire
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=wQUH06QRCi4
  creators: Kohta Yamamoto
  notes: Another case of the original song metadata being corrupted somehow and throwing off VLC playlists...

- name: The Other Side of the Sea
  tags: Primary
  url: https://www.youtube.com/watch?v=2rU1qfwtJpA
  creators: Samuel Kim

- name: Warhammer
  tags: Primary
  url: https://www.youtube.com/watch?v=rKNQHBl_Zmk
  creators: Samuel Kim

- name: Transformation
  tags: Primary
  url: https://www.youtube.com/watch?v=EPdNwZEaE60
  creators: Samuel Kim

- name: Counterattack (Sasha)
  tags: Primary
  url: https://www.youtube.com/watch?v=3Ki8c4exFPY
  creators: Samuel Kim
  notes: "TODO: Maybe clip and copy first part to serve as pre-Ashes intro after Boko no Sensou?"

- name: Zero Silence
  tags: Primary
  url: https://www.youtube.com/watch?v=eefNPsDAPQk
  creators: Samuel Kim
  notes: Blend of Call of Silence and Zero Eclipse.

- name: Cost of Freedom
  tags: Primary
  url: https://www.youtube.com/watch?v=Md0WKA05dkw
  creators: Samuel Kim

- name: The Rumbling (Short)
  tags: Primary
  url: https://www.youtube.com/watch?v=6zsDmeTr2_k
  creators: Shayne Orok
  notes: Better vocals than the classic.

- name: Footsteps of Doom
  tags: Primary
  url: https://www.youtube.com/watch?v=4cPvtOfkkIM
  creators: Samuel Kim
  notes: Technically a cross with another theme as well.

- name: Barricades
  tags: Primary
  url: https://www.youtube.com/watch?v=pe9tut8EN8c
  creators: Kyle Brook
  notes: Best vocal and band cover; many others with more views+likes (in December 2024), which is so sad...

- name: Fall of Paradise
  tags: Primary
  url: https://www.youtube.com/watch?v=P9sFbJLrsTc
  creators: Samuel Kim

- name: Defending Freedom
  tags: Primary
  url: https://www.youtube.com/watch?v=2V4ODrOp1jM
  creators: Samuel Kim

- name: Bauklotze
  tags: Primary
  url: https://www.youtube.com/watch?v=8NvUpA2FvUI
  creators: B-Lion
  notes: |
      Vocals are superior to the classic.
      Has almost no exposure compared to the other covers despite being the absolute best.

- name: Before Lights Out
  tags: Primary
  url: https://www.youtube.com/watch?v=KAe3CHA4vU8
  creators: Samuel Kim

- name: Splinter Wolf
  tags: Primary, Workout
  url: https://www.youtube.com/watch?v=ZBLoZczkQYc
  creators: Hurakion

- name: Final Battle
  tags: Primary
  url: https://www.youtube.com/watch?v=9HaB4cVSNnw
  creators: Samuel Kim
  notes: "TODO: split the latter part into separate entry that goes after Yamanaiame?"

- name: Call of Silence (Emotional)
  tags: Primary, Emotional
  url: https://www.youtube.com/watch?v=RsUl6hTWyPY
  creators: PianoPrinceOfAnime
  notes: |
      Much softer and more powerful than any other cover or the original.
      Another one where the upload gets much less attention than other covers despite being much better...

- name: Yamanaiame
  tags: Primary, Workout
  url: https://www.youtube.com/watch?v=3Zd7kjXVTAg
  creators: Hurakion, Tempered Lion, Chryels

- name: Aftermath
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=eTny2eJhJXY
  creators: Hiroyuki Sawano

- name: So Ist es Immer
  tags: Primary, Original
  url: https://www.youtube.com/watch?v=VE866qNUbwk
  creators: Hiroyuki Sawano

- name: Reluctant Heroes (Emotional)
  tags: Primary, Emotional
  url: https://www.youtube.com/watch?v=bOFhatyCEhQ
  creators: AmaLee
  notes: |
      Not 100% crazy about the vocals but the idea is good.
      Best lyrics.

- name: Under the Tree (Emotional)
  tags: Primary, Emotional
  url: https://www.youtube.com/watch?v=3V7pjl3H3Yk
  creators: Samuel Kim, Lorien
  notes: |
      Best form of this song; the original metal version was not the best way to go for an emotional take.
      Though I do wish it ended with the 'I will take you...' trailing off with reverb at the end.
      Original song metadata is corrupted somehow and throws off VLC playlists...

- name: Vogel im Kafig (Original)
  tags: Original
  url: https://www.youtube.com/watch?v=H76_uW1Fnso
  creators: Hiroyuki Sawano

- name: Attack on Titan
  tags: Original
  url: https://www.youtube.com/watch?v=jfAbX-Fg9N0
  creators: Hiroyuki Sawano

- name: Reluctant Heroes (No Regrets)
  tags: Original
  url: https://www.youtube.com/watch?v=LfmhBqGNErU
  creators: Hiroyuki Sawano
  notes: |
      Note that this is not the actual original Reluctant Heroes from Season 1, which does not appear in any of
      these listings because everything else here is better in some way or another.

- name: 0Sk
  tags: Original
  url: https://www.youtube.com/watch?v=nY7YSWWPmkQ
  creators: Hiroyuki Sawano

- name: Yamanaiame (Original)
  tags: Original
  url: https://www.youtube.com/watch?v=O_mvk2_MXtA
  creators: Hiroyuki Sawano

- name: Guren no Yumiya (Original)
  tags: Original
  url: https://www.youtube.com/watch?v=CgAeJxvFubI
  creators: Linked Horizon

- name: Jiyu no Tsubasa
  tags: Original
  url: https://www.youtube.com/watch?v=W8UNLOOogU4
  creators: Linked Horizon
  notes: Wish there was a way to remove audience noise.

- name: Call of Silence (Original)
  tags: Original
  url: https://www.youtube.com/watch?v=B-1ZzOp0UUA
  creators: Hiroyuki Sawano

- name: Boku no Sensou (Full)
  tags: Original
  url: https://www.youtube.com/watch?v=sXiOuwlcn3U
  creators: SiM
  notes: aka My War

- name: Barricades (Original)
  tags: Original
  url: https://www.youtube.com/watch?v=BXsjKvdEae4
  creators: Hiroyuki Sawano
  notes: Good backtrack but the vocals fall short of other performers.

- name: The Rumbling (Full)
  tags: Original
  url: https://www.youtube.com/watch?v=s4LqBi563GQ
  creators: SiM

- name: Aftermath (No Regrets)
  tags: Original
  url: https://www.youtube.com/watch?v=iW3NGzslPik
  creators: Hiroyuki Sawano

- name: Under the Tree
  tags: Original
  url: https://www.youtube.com/watch?v=IPX-L2F78fU
  creators: SiM

# These are either background tracks or otherwise can't figure out where best they belong in the Primary tag

- name: Daily Life
  tags: Original, Secondary
  url: https://www.youtube.com/watch?v=S4VIQJq8MCA
  creators: Hiroyuki Sawano

- name: Rittaikidou
  tags: Secondary
  url: https://www.youtube.com/watch?v=Rtzif7t2aHY
  creators: Hurakion

- name: This is Freedom
  tags: Secondary
  url: https://www.youtube.com/watch?v=_7vI-fC1B0Q
  creators: Samuel Kim

- name: Akuma no Ko
  tags: Secondary
  url: https://www.youtube.com/watch?v=zW_tg3tr3ak
  creators: Samuel Kim
  notes: Corresponds to the colors of the world speech at the end, but where should it belong?

- name: Akuma no Ko (English)
  tags: Secondary
  url: https://www.youtube.com/watch?v=m8s0Qp64uM4
  creators: AmaLee
  notes: |
      Sufficiently different from the original Akuma no Ko to exist in the same list.
      Deep piano chords really hit; great vocals too, good lyrical translation.

- name: Beautiful Cruel World
  tags: Secondary
  url: https://www.youtube.com/watch?v=O03MsgW8X1k
  creators: The Evolved
  notes: |
      Groovy.
      Just can't figure out where it could fit in the main listing...
      Amazing how little views this has...

- name: Apple Seed (Epic)
  tags: Secondary
  url: https://www.youtube.com/watch?v=1e_xCN1R2og
  creators: Hurakion
  notes: |
      Crossed with the Hashira (Demon Slayer) theme.
      Sounds great, just can't figure out where it's best in the main order...

- name: Paths
  tags: Secondary
  url: https://www.youtube.com/watch?v=5ahz_GcK6ew
  creators: Hurakion
  notes: Great and epic, just can't figure out where to fit.

- name: Wandering
  tags: Secondary
  url: https://www.youtube.com/watch?v=IjCLodK3Slg
  creators: Hiroyuki Sawano
  notes: Possibly for the time Eren wandered across the sea?

# Alternate versions

- name: Titan Invasion (English)
  tags: Alternate
  url: https://www.youtube.com/watch?v=Gi2Nd9k1CLE
  creators: Crystilo

- name: Eye Water (Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=5JKLX-cw9Sw
  creators: Samuel Kim

- name: Counterattack (Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=ikmBtnYCvaA
  creators: Tony Anthony
  notes: Higher def, more orchestral.

- name: Counterattack (Slower)
  tags: Alternate
  url: https://www.youtube.com/watch?v=X1Ljz5rEwgA
  creators: Hurakion
  notes: Great acoustics. Maybe too slow?

- name: Beautiful Cruel World
  tags: Alternate
  url: https://www.youtube.com/watch?v=zRq2Wcu1h6U
  creators: AmaLee
  notes: Not as good as The Evolved version, but still decent.

- name: Beautiful Cruel World (Emotional)
  tags: Alternate, Emotional
  url: https://www.youtube.com/watch?v=BYd_6nFWGV4
  creators: BriCie
  notes: Softer than the others.

- name: Weight of Lives
  tags: Alternate
  url: https://www.youtube.com/watch?v=7PUALY6eE7o
  creators: Samuel Kim
  notes: Extended, mixed version of Berserk theme.

- name: Guren no Yumiya (English Metal)
  tags: Alternate
  url: https://www.youtube.com/watch?v=aFcfgHfEEsw
  creators: Jonathan Young

- name: Guren no Yumiya (English Pop)
  tags: Alternate
  url: https://www.youtube.com/watch?v=Czam1dKjoCc
  creators: AmaLee
  notes: "TODO: all AmaLee need intro/outro's clipped"

- name: Shinzou wo Sasageyo (English)
  tags: Alternate
  url: https://www.youtube.com/watch?v=6Lhw-o-iO6g
  creators: NateWantsToBattle

- name: Red Swan (Full English)
  tags: Alternate
  url: https://www.youtube.com/watch?v=QCqV0wtUh1w
  creators: AmaLee

- name: Red Swan (Full English, Male Vocals, Softer)
  tags: Alternate, Emotional
  url: https://www.youtube.com/watch?v=N4jQu3NCQw4
  creators: GoldenBoys
  notes: |
      Longer than AmaLee's, slightly more favorable lyrics.
      Their video gave full credit to Yoshiki & Hyde, unlike AmaLee's.

- name: Zero Eclipse (Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=P11TPsyPw3U
  creators: Mike Reed IX
  notes: Partly LoFi? The end diverges into other themes though?

- name: Zero Eclipse (Pure Piano)
  tags: Alternate, Piano
  url: https://www.youtube.com/watch?v=rabg6NUg-wU
  creators: PianoDeuss
  notes: Video has sheet music (unsure about MIDI file), looks like something I could actually learn!

- name: My War (Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=4hcagmvPbLw
  creators: Samuel Kim
  notes: |
      TODO: split at the halfway point; has both a pure orchestral and slightly lyrical version here.
      Would REALLY love to get the haunting vocal dissonance in the PelleK or Jenny version added at the start.
      Best orchestral/symphonic integration.

- name: My War
  tags: Alternate
  url: https://www.youtube.com/watch?v=HHZySYoyYL4
  creators: NateWantsToBattle
  notes: Best metal backtrack, vocals are mid.

- name: My War (Metal)
  tags: Alternate
  url: https://www.youtube.com/watch?v=9UoSWia5g6g
  creators: PelleK

- name: Ashes on the Fire (Alternate)
  tags: Alternate
  url: https://www.youtube.com/watch?v=qwkbmJEXQtE
  creators: PianoPrinceOfAnime
  notes: Overall lower sound quality than the Yamamoto one.

- name: Akuma no Ko (Shorter)
  tags: Alternate
  url: https://www.youtube.com/watch?v=ql9bKA8p3uA
  creators: Shayne Orok
  notes: More interesting vocals than the original, but not necessarily better overall.

- name: Call of Silence (Alternate)
  tags: Alternate
  url: https://www.youtube.com/watch?v=xwQBdJod2VI
  creators: Samuel Kim
  notes: Not bad just too thematically similar to other better ones.

- name: Barricades (Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=yGgmNBx_koE
  creators: Samuel Kim

- name: The Rumbling (English Metal)
  tags: Alternate, Workout
  url: https://www.youtube.com/watch?v=XobTQPudYRw
  creators: Jonathan Young

- name: The Rumbling (LoFi)
  tags: Alternate, LoFi
  url: https://www.youtube.com/watch?v=osWT-nzR4FE
  creators: Samuel Kim

- name: The Rumbling (Piano LoFi)
  tags: Alternate, LoFi, Piano
  url: https://www.youtube.com/watch?v=oHwahhmqgY0
  creators: Kioshi

- name: The Dogs (Orchestral)
  tags: Original, Alternate, Orchestral
  url: https://www.youtube.com/watch?v=QRDmHhhH1pw
  creators: by Hiroyuki Sawano

- name: The Dogs (Female Vocals)
  tags: Alternate
  url: https://www.youtube.com/watch?v=zIMN92K7ctI
  creators: Chryels

- name: So Ist es Immer (Piano Duet)
  tags: Alternate, Piano
  url: https://www.youtube.com/watch?v=yS-o_J3NPrc
  creators: Samuel Kim
  notes: |
      Better vocals than the original, but the guitar is quite crucial so this falls short.
      TODO: splice out the Anime injections partway.

- name: So Ist es Immer (Piano)
  tags: Alternate, Piano
  url: https://www.youtube.com/watch?v=lwrqFONNxVU
  creators: PianoDeuss
  notes: Looks like it has a flowkey as well! Wish the tempo was a bit faster.

# There are many covers of Vogel im Kafig (no good English versions though, the lyrics are too odd...)

- name: Vogel im Kafig (Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=6Ulso8te6lc
  creators: Samuel Kim

- name: Vogel im Kafig (Grissini Project, Orchestral)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=i9SwzEhfBLc
  creators: Grissini Project
  notes: Remaster, best vocals of any, but the overall mix isn't as good as the one selected above.

- name: Vogel im Kafig (Grissini Project, Quartet)
  tags: Alternate, Orchestral
  url: https://www.youtube.com/watch?v=ajJanul_K4k
  creators: Grissini Project
  notes: |
      Mix is better than other Grissini one, vocals still incredible.
      Slower pace and so closer to what I love about the primary selected one.
      But missing the orchestral element.

- name: Vogel im Kafig (Piano)
  tags: Alternate, Piano
  url: https://www.youtube.com/watch?v=L8YIB2L6g3E
  creators: PianoDeuss
  notes: Looks like it has a flowkey as well!

# There are also so many miscellaneous covers of Reluctant Heroes... Not one of them is completely perfect.
# The biggest issue is the repetitive nature of the lyrics. They could easily be extended to not repeat so much.

- name: Reluctant Heroes (Soft Piano)
  tags: Alternate, Piano
  url: https://www.youtube.com/watch?v=5ESySBbv4B8
  creators: Kato

- name: Reluctant Heroes (LoFi Hip Hop)
  tags: Alternate, LoFi
  url: https://www.youtube.com/watch?v=o_MgS_6nBcg
  creators: Atemu

- name: Reluctant Heroes (Guitar, Folky)
  tags: Alternate, Guitar
  url: https://www.youtube.com/watch?v=fpGMIoFmkxg
  creators: Mica Caldito
  notes: |
      Not crazy about the actual vocals but they aren't terrible.
      Dislike some of the huge swings (too country), nor frequency of the lesser ones.
      Lyrics are pretty good, just slightly over-repetitive.
      Tempo is probably one of the best, though. Not too slow or fast.

- name: Reluctant Heroes (Piano)
  tags: Alternate, Piano
  url: https://www.youtube.com/watch?v=3bepx_LeIuI
  creators: Tara St. Michel
  notes: Not the best vocals. Nice background chords.

- name: Call Your Name (Instrumental)
  tags: Original, Orchestral
  url: https://www.youtube.com/watch?v=8J9j3ZJ2Z1I
  creators: Hiroyuki Sawano

- name: My War (LoFi)
  tags: Alternate, LoFi
  url: https://youtu.be/oCXIEfHR1Qk
  creators: Kijugo

- name: Call of Silence (LoFi)
  tags: Alternate, LoFi
  url: https://music.youtube.com/watch?v=e6yanHub9Jg
  creators: Mik & Samuel Kim

- name: Guren no Yumiya (LoFi)
  tags: Alternate, LoFi
  url: https://music.youtube.com/watch?v=1IFK6tmSGhg
  creators: luvbyrd

- name: Zero Eclipse (LoFi)
  tags: Alternate, LoFi
  url: https://music.youtube.com/watch?v=nyPPSvaCCZQ
  creators: Mik & Samuel Kim

- name: Call Your Name (Original)
  tags: Original
  url: https://music.youtube.com/watch?v=oLyXJHsYCq8
  creators: Hiroyuki Sawano
  notes: This is technically the true 'original', but I dislike the vocals (but love the backtrack).

- name: Yamanaiame (Original, Instrumental)
  tags: Original, Instrumental
  url: https://music.youtube.com/watch?v=At4FwcULnDk
  creators: Hiroyuki Sawano
`,w=`- name: Fading Light
  tags: Games
  url: https://www.youtube.com/watch?v=WCgmF9a9uG0
  creators: Aviators
  notes: SoulSong version.

- name: Dreams of the Deep
  tags: Games
  url: https://www.youtube.com/watch?v=iTJiMHDIrqE
  creators: Aviators

- name: Follow You Down
  tags: Games
  url: https://www.youtube.com/watch?v=qcFED7j_hyA
  creators: Aviators, 4everfreebrony

- name: Dystopian Fiction
  tags: Games
  url: https://www.youtube.com/watch?v=g1On6366zOw
  creators: Aviators

- name: The Wall of Sleep
  tags: Games
  url: https://www.youtube.com/watch?v=j1gFuRbNKHs
  creators: Aviators

- name: Bleeding Sun
  tags: Games
  url: https://www.youtube.com/watch?v=BER5ugMOArg
  creators: Aviators

- name: Fires Fade
  tags: Games
  url: https://www.youtube.com/watch?v=Y_PITYbmrjU
  creators: Miracle of Sound

- name: Dark Souls 1 Prologue
  tags: Games
  url: https://www.youtube.com/watch?v=to90vjaAl2k
  creators: ""

- name: Dark Souls 3 Prologue
  tags: Games
  url: https://www.youtube.com/watch?v=XFbl25KwDLk
  creators: ""

- name: Abyss Watchers
  tags: Games
  url: https://www.youtube.com/watch?v=5qY-gWF9AF8
  creators: Alex Roe
  notes: Great remix of the original.

# Lost two songs here from the original playlist...

- name: Longing
  tags: Games
  url: https://www.youtube.com/watch?v=q3jAHIuulWE
  creators: Motoi Sakuraba

- name: Maiden Astraea
  tags: Games
  url: https://www.youtube.com/watch?v=cXrxWBVdunY
  creators: ""
`,T=`- name: Sound of Silence
  tags: Workout
  url: https://www.youtube.com/watch?v=kh0BWQ4Uo6w
  creators: Disturbed

- name: Inside the Fire
  tags: Workout
  url: https://www.youtube.com/watch?v=kh0BWQ4Uo6w
  creators: Disturbed

- name: Down with the Sickness
  url: https://www.youtube.com/watch?v=Ea6JCPUfito
  creators: Disturbed
  notes: "TODO: clip out annoying part"

- name: Stricken
  url: https://www.youtube.com/watch?v=MsTXcJGeYEg
  creators: Disturbed

- name: Indestructible
  url: https://www.youtube.com/watch?v=tlE8252-xMc
  creators: Disturbed
  notes: "TODO: clip out early part"

- name: The Light
  url: https://www.youtube.com/watch?v=s3hUh558iv4
  creators: Disturbed

- name: The Vengeful One
  url: https://www.youtube.com/watch?v=gFCu_YK6yPE
  creators: Disturbed

- name: Sound of Silence
  url: https://music.youtube.com/watch?v=u9Dg-g7t2l4
  creators: Disturbed
`,te=`- name: Alicia
  url: steam
  creators: Lorien Testard

- name: Lumière à l'Aube
  url: steam
  creators: Lorien Testard

- name: Megabot33
  url: steam
  creators: Lorien Testard
`,E=`- name: Alicia
  url: steam
  creators: Lorien Testard

- name: Gustave
  url: steam
  creators: Lorien Testard

- name: Lumière
  url: steam
  creators: Lorien Testard
`,ne=`- name: Elden Ring Trailer
  tags: Games, Trailer
  url: https://www.youtube.com/watch?v=FDnBx6x8q2U
  creators: ""

- name: Elden Ring Theme
  tags: Games
  url: https://www.youtube.com/watch?v=twf_rAEAUAw
  creators: CJ Music

- name: Elden Ring, Final Battle
  tags: Games
  url: https://www.youtube.com/watch?v=2dQJH0znZwI
  creators: REVEN

- name: Regal Ancestor Spirit
  tags: Games, Trailer
  url: https://www.youtube.com/watch?v=hiv5bkcgCtA
  creators: Yuka Kitamura

- name: Erdtree Aflame
  tags: Games
  url: https://www.youtube.com/watch?v=-CIiagdgTxA
  creators: ""

- name: Rune of Death
  tags: Games
  url: https://www.youtube.com/watch?v=kpTc4vtPY0U
  creators: Shoi Miyazawa

- name: Elden Beast
  tags: Games
  url: https://www.youtube.com/watch?v=MCM76Q16WYg
  creators: ""
`,D=`- name: Invincible
  tags: Warcraft
  url: https://www.youtube.com/watch?v=EV46qFZrOzk
  creators: ""

- name: Gotham is Mine
  tags: Batman
  url: https://www.youtube.com/watch?v=av6s4J53rCo
  creators: ""

- name: All Who Follow You
  tags: Batman
  url: https://www.youtube.com/watch?v=oL3sXFeB8YQ
  creators: ""

- name: Fires of War
  tags: Lord of the Rings
  url: https://www.youtube.com/watch?v=QrBihZya6s4
  creators: Nathan Grigg, Kelli Schaefer

- name: Surtr
  tags: Senua
  url: https://www.youtube.com/watch?v=tKEldv3vtcg
  creators: ""

- name: Just Like Sleep
  tags: Senua
  url: https://www.youtube.com/watch?v=x-e-REZr31I
  creators: Passarella Death Squad
`,O=`- name: The Last of Us
  tags: Games
  url: https://www.youtube.com/watch?v=cwDkutphzmU
  creators: ""

- name: Wayfaring Stranger
  tags: Guitar, Emotional, Games
  url: https://www.youtube.com/watch?v=Pb2yXpPC9Qc
  creators: ""

- name: Through the Valley
  tags: Guitar, Emotional, Games
  url: https://www.youtube.com/watch?v=jfSuU4Sibzg
  creators: ""

- name: True Faith
  tags: Guitar, Emotional, Games
  url: https://www.youtube.com/watch?v=bbTu843BQr4
  creators: ""
  notes: Inspired by Lotte Kestner's cover of the song.

- name: Future Days
  tags: Guitar, Duet, Emotional, Games
  url: https://www.youtube.com/watch?v=R4x4RSIVsMc
  creators: ""
`,k=`- name: Enemy
  tags: Arcane
  url: https://www.youtube.com/watch?v=IOrbP1OqNsg
  creators: Imagine Dragons

- name: Sardaukar Chant
  tags: Dune
  url: https://www.youtube.com/watch?v=eoOfK6x5s1U
  creators: Hans Zimmer
  notes: "TODO: unfade middle part"

- name: Black Blade
  tags: Epic
  url: https://music.youtube.com/watch?v=skBwn3A3QAw
  creators: Two Steps from Hell
`,A=`- name: Warriors
  tags: Metal
  url: https://music.youtube.com/watch?v=sw9bRT-ezZA
  creators: Freedom Call

- name: Through the Fire and Flames
  tags: Metal
  url: https://music.youtube.com/watch?v=LYiaOW3YugI
  creators: Dragonforce

- name: Heroes Of Our Time
  tags: Metal
  url: https://music.youtube.com/watch?v=4u5Le989KsQ
  creators: Dragonforce

- name: Scary Monsters and Nice Sprites
  tags: Synth
  url: https://music.youtube.com/watch?v=DXGY5bXBzhg
  creators: Skrillex

- name: The Game Has Changed
  tags: Synth
  url: https://music.youtube.com/watch?v=FKAYXjnqGkU
  creators: Daft Punk

- name: Drive It Like You Stole It
  tags: Synth
  url: https://music.youtube.com/watch?v=FKAYXjnqGkU
  creators: The Glitch Mob

- name: Animus Vox
  tags: Synth
  url: https://music.youtube.com/watch?v=cefY0sXQo0U
  creators: The Glitch Mob

- name: Bad Wings
  tags: Synth
  url: https://music.youtube.com/watch?v=7T4JN8Dgtik
  creators: The Glitch Mob

- name: Fortune Days
  tags: Synth
  url: https://music.youtube.com/watch?v=AckG0JVrYDA
  creators: The Glitch Mob

- name: Rainbow in the Dark
  tags: Rock
  url: https://music.youtube.com/watch?v=cAeDOt8kI4g
  creators: Dio
`,j=`- name: Wake Up
  url: https://www.youtube.com/watch?v=4lzqUe1Qfec
  creators: Rage Against the Machine
  notes: "TODO: clip out the later part"

- name: Killing in the Name
  url: https://www.youtube.com/watch?v=bWXazVhlyxQ
  creators: Rage Against the Machine

- name: Bulls on Parade
  url: https://www.youtube.com/watch?v=my6bfA14vMQ
  creators: Rage Against the Machine

- name: Sleep Now in the Fire
  url: https://www.youtube.com/watch?v=3ITF4HoRZRY
  creators: Rage Against the Machine

- name: People of the Sun
  url: https://www.youtube.com/watch?v=C_YtCpC12Kg
  creators: Rage Against the Machine

- name: Wake Up (Alternate)
  url: https://www.youtube.com/watch?v=0JrlKcoD1Qw
  creators: Sophia Urista
`,re=`- name: SPECIALZ
  url: https://www.youtube.com/watch?v=5RaU8K8sLTM
  creators: King Gnu
`,ie=`- Alicia
- Lumière à l'Aube
- Megabot33
- Monoco
- Is it a Gestral or a Volleyball
- Déchire la Toile
- Robe de Jour
- Rouge d'Iris
- Une vie à Peindre
- Clair-Obscur
- For Those Who Come After (Instrumental)
`,M=`- Alicia
- Gustave
- Lumière
- Lumière à l'Aube
- Promenade dans Lumière
- Le Grand Café de Lumière
- Continuer à t'aimer (Lune)
- Rêveries dans Lumière
- Nocturne pour Lumière (Violoncelle)
- The Departure
- Cloud of Anxiety
- Cello Motifs
- Éveil
- Burial of the Lights
- Get Up! For Lumière!
- Linen and Cotton
- Battling Breeze
- Beneath the Blue Tree
- Tomorrow is Here
- Nightfall (Act I)
- Nightfall (Act II)
- L'Aurore aux Doigts de Roses
- Lune
- Taking Down the Paintress
- In Lumière's Name
- Until You're Gone
- Forlorn
- Submerged Lights
- Electric Tides
- Goblu
- Serpenphare
- Rain from the Ground
- The Curator
- Un 33 Décembre à Paris
- Path on the Roots
- Bonzaie Clairing
- Lake
- Gestral Summer Party
- Megabot33
- Entrance of the Village
- Gestral Market
- Gestral Merchant
- Alicia (Gestrals)
- Continuer à t'aimer (Gestrals)
- Golgra's Throne
- Gestral Arena
- Golgra
- Sciel
- Esquie's Bath
- François
- Firecamp - Sciel
- Firecamp - Lune
- The Whale Next to the Cliff
- Missing Hope
- Lights of the Past
- Sandfall
- The Last Thing You'll See
- Warding Blades
- Lampmaster
- Loin d'Elle
- Une vie à t'aimer
- Verso
- Cemetery's Boat
- Lueur Déclinante
- Over the Fallen
- Divided Swords
- Dualliste
- Red Birds are Tied to the Ground
- Lost Voice
- Maelle's First Snow
- Follow the Steps of Monoco
- Grandis Domain
- Ice's Caves
- When the Snow Cries
- Tics Tacs
- Grandis Refuge
- Twirling Voices
- Monoco
- I'd Rather Play Pétanque!
- My Grandma Hits Harder!
- Is it a Gestral or a Volleyball
- Numbers the Hours
- Honey and Clayworks
- Noco's Root
- Cave
- Amber and Sap
- Autumn's Brush
- River Dream
- Déchire la Toile
- Waiting Canvas
- Of Virtuosity and Heart
- Gustave's Legacy
- Lumière s'éteint
- Fragments Tell Stories
- When the Dust Settles
- Révérence
- Eiffel
- L'Amour d'un Père
- Tout ce que je suis, pour toi
- Robe de Jour
- Robe de Nuit
- Tisser la Beauté
- Rouge d'Iris
- Poème d'Amour
- Nocturne pour un Masque de Joie
- Nocturne pour un Masque de Tristesse
- Nocturne pour un Masque de Colère
- Aria pour un Masque de Colère
- Aria pour un Masque de Tristesse
- Aria pour un Masque de Joie
- Idéal Mental
- Portrait Imparfait
- Mains Subtiles
- Peindre la Perfection
- Contre le Coeur
- Fleur de Paris
- L'amour d'une Soeur
- Clea
- Stuck in Maelle's Head
- Naissance des Cendres
- Mémoires
- Vers le Sommet
- Entre les Marais et les Cimes
- Orphelin
- Près de Lui
- Aline
- Paintress
- L'Amour d'une Mère
- Lettre à Maelle
- We Lost
- Dolorosa
- Verso (Music Box)
- Lullaby for my Sister (Music Box)
- Gustave (Music Box)
- Lumière (Music Box)
- Sciel (Music Box)
- Lune (Music Box)
- Alicia (Music Box)
- Continuer à t'aimer (Piano)
- Nuit sur Lumière
- Un Air de Famille
- Our Painted Hatred
- Children of Lumière
- Renoir
- Une vie à Peindre
- Shared Canvas
- Endless Light
- It's Time to Stop Painting
- Our Drafts Collides
- Until Next Life
- Clair-Obscur
- Une vie à rêver
- Aux Lendemains non Écrits
- Maelle
- Nos vies en Lumière
- World Map - Taking Down the Paintress (Instrumental)
- Flying Waters - Avasha Kapasatara
- Our Drafts Unite
- Gestral Village - Fight for the Win (Uno Puncho)
- Gestral Village - Gestral Private Club
- Monoco (Release Date Reveal)
- Le Carousel de Lumière
- Hold me Esquie
- Sciel (Piano)
- Alicia (Violin)
- Whispers of Tomorrow
- Nocturne pour Lumière
- Shadow of the Monolith (Cast Reveal Trailer)
- For Those Who Come After (Release Date Reveal Trailer)
- We are Expedition 33 (Reveal Trailer)
- World Map - Our Painted Death
- For Those Who Come After (Instrumental)
- For Those Who Come After
- Until Next Life (Solo Voice)
- Simon, The Divergent Star
- Alicia (Reveal Trailer)
`,ae=`- SPECIALZ
- Reluctant Heroes
- Splinter Wolf
- Yamanaiame
- Apple Seed
- The Rumbling
- Dark, Twisted and Cruel
- Inside the Fire
- Barricades
- Call Your Name (Original)
- The Poet and the Muse
- Falling Up
- BELIEVE
- Abyss
`,N=Symbol(`NOT_RESOLVED`);function P(e,t){return{tagName:e,nodeKind:`scalar`,implicit:t.implicit??!1,matchByTagPrefix:t.matchByTagPrefix??!1,implicitFirstChars:t.implicitFirstChars??null,resolve:t.resolve,identify:t.identify,represent:t.represent??(e=>String(e)),representTagName:t.representTagName??(()=>e)}}function F(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`sequence`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addItem:t.addItem,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}function I(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`mapping`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addPair:t.addPair,has:t.has,keys:t.keys,get:t.get,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}var oe=P(`tag:yaml.org,2002:str`,{resolve:e=>e,identify:e=>typeof e==`string`}),se=[``,`~`,`null`,`Null`,`NULL`],ce=P(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>se.indexOf(e)===-1?N:null,identify:e=>e===null,represent:()=>`null`}),le=P(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[`n`],resolve:(e,t)=>e===`null`||t&&e===``?null:N,identify:e=>e===null,represent:()=>`null`}),ue=[``,`~`,`null`,`Null`,`NULL`],de=P(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>ue.indexOf(e)===-1?N:null,identify:e=>e===null,represent:()=>`null`}),fe=[`true`,`True`,`TRUE`],pe=[`false`,`False`,`FALSE`],me=P(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`T`,`f`,`F`],resolve:e=>fe.indexOf(e)!==-1||pe.indexOf(e)===-1&&N,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),he=[`true`],ge=[`false`],_e=P(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`f`],resolve:e=>he.indexOf(e)!==-1||ge.indexOf(e)===-1&&N,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),ve=[`true`,`True`,`TRUE`,`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`],ye=[`false`,`False`,`FALSE`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`],be=P(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`y`,`Y`,`n`,`N`,`t`,`T`,`f`,`F`,`o`,`O`],resolve:e=>ve.indexOf(e)!==-1||ye.indexOf(e)===-1&&N,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),xe=RegExp(`^(?:0o[0-7]+|0x[0-9a-fA-F]+|[-+]?[0-9]+)$`),Se=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Ce(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function we(e,t){if(t){if(!Se.test(e))return N}else if(!xe.test(e))return N;let n=Ce(e);return Number.isFinite(n)?n:N}var Te=P(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:we,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Ee=RegExp(`^-?(?:0|[1-9][0-9]*)$`),De=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Oe(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function ke(e,t){if(t){if(!De.test(e))return N}else if(!Ee.test(e))return N;let n=Oe(e);return Number.isFinite(n)?n:N}var Ae=P(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:ke,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),je=RegExp(`^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?0x[0-9a-fA-F_]+|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+|[-+]?(?:0|[1-9][0-9_]*))$`);function Me(e){let t=e.replace(/_/g,``),n=1;if((t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`))return n*parseInt(t.slice(2),2);if(t.startsWith(`0x`))return n*parseInt(t.slice(2),16);if(t.includes(`:`)){let e=0;for(let n of t.split(`:`))e=e*60+Number(n);return n*e}return t!==`0`&&t[0]===`0`?n*parseInt(t,8):n*parseInt(t,10)}function Ne(e){if(!je.test(e))return N;let t=Me(e);return Number.isFinite(t)?t:N}var Pe=P(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:Ne,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Fe=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),Ie=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function Le(e){if(!Fe.test(e))return N;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)||Ie.test(e)?r:N}function Re(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var ze=P(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:Le,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Re}),Be=RegExp(`^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$`),Ve=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function He(e,t){if(t){if(!Ve.test(e))return N;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)?r:N}if(!Be.test(e))return N;let n=Number(e);return Number.isFinite(n)?n:N}function Ue(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var We=P(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:He,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Ue}),Ge=RegExp(`^(?:[-+]?(?:(?:[0-9][0-9_]*)?\\.[0-9_]*)(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),Ke=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function qe(e){if(!Ge.test(e))return N;let t=e.toLowerCase().replace(/_/g,``),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=0;if(t.includes(`:`)){for(let e of t.split(`:`))r=r*60+Number(e);r*=n}else r=n*parseFloat(t);return Number.isFinite(r)||Ke.test(e)?r:N}function Je(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Ye=P(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:qe,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Je}),Xe=P(`tag:yaml.org,2002:merge`,{implicit:!0,implicitFirstChars:[`<`],resolve:(e,t)=>e===`<<`||t&&e===``?`<<`:N,identify:()=>!1}),Ze=/^[A-Za-z0-9+/]*={0,2}$/;function Qe(e){let t=e.replace(/\s/g,``);if(t.length%4!=0||!Ze.test(t))return N;let n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function $e(e){let t=``;for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var et=P(`tag:yaml.org,2002:binary`,{resolve:Qe,identify:e=>Object.prototype.toString.call(e)===`[object Uint8Array]`,represent:$e}),tt=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),nt=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function rt(e,t,n,r=0,i=0,a=0,o=0){let s=new Date(Date.UTC(e,t,n,r,i,a,o));return s.setUTCFullYear(e,t,n),s}function it(e){let t=tt.exec(e);if(t===null&&(t=nt.exec(e)),t===null)return N;let n=+t[1],r=t[2]-1,i=+t[3];if(!t[4]){let e=rt(n,r,i);return e.getUTCFullYear()!==n||e.getUTCMonth()!==r||e.getUTCDate()!==i?N:e}let a=+t[4],o=+t[5],s=+t[6],c=0;if(a>23||o>59||s>59)return N;if(t[7]){let e=t[7].slice(0,3);for(;e.length<3;)e+=`0`;c=+e}let l=rt(n,r,i,a,o,s,c);if(l.getUTCFullYear()!==n||l.getUTCMonth()!==r||l.getUTCDate()!==i)return N;if(t[9]){let e=+t[10],n=+(t[11]||0);if(e>23||n>59)return N;let r=(e*60+n)*6e4;l.setTime(l.getTime()-(t[9]===`-`?-r:r))}return l}var at=P(`tag:yaml.org,2002:timestamp`,{implicit:!0,implicitFirstChars:[...`0123456789`],resolve:it,identify:e=>e instanceof Date,represent:e=>e.toISOString()}),ot=F(`tag:yaml.org,2002:seq`,{create:()=>[],addItem:(e,t)=>{e.push(t)},identify:Array.isArray});function st(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===null||t===Object.prototype}function ct(e,t){let n={};for(let r of t)e[r]!==void 0&&(n[r]=e[r]);return n}var lt=F(`tag:yaml.org,2002:omap`,{create:()=>({list:[],seen:new Set}),addItem:(e,t)=>{let n;if(t instanceof Map){if(t.size!==1)return`cannot resolve an ordered map item`;n=t.keys().next().value}else if(st(t)){let e=Object.keys(t);if(e.length!==1)return`cannot resolve an ordered map item`;n=e[0]}else return`cannot resolve an ordered map item`;return e.seen.has(n)?`duplicate key in ordered map`:(e.seen.add(n),e.list.push(t),``)},finalize:e=>e.list,identify:()=>!1}),ut=F(`tag:yaml.org,2002:pairs`,{create:()=>[],addItem:(e,t)=>{if(t instanceof Map)return t.size===1?(e.push(t.entries().next().value),``):`cannot resolve a pairs item`;if(Object.prototype.toString.call(t)!==`[object Object]`)return`cannot resolve a pairs item`;let n=t,r=Object.keys(n);return r.length===1?(e.push([r[0],n[r[0]]]),``):`cannot resolve a pairs item`},identify:()=>!1}),dt=I(`tag:yaml.org,2002:map`,{create:()=>({}),identify:st,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{if(typeof t==`object`&&t)return`object-based map does not support complex keys`;let r=String(t);return r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``},has:(e,t)=>typeof t==`object`&&t?!1:Object.prototype.hasOwnProperty.call(e,String(t)),keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}}),ft=I(`tag:yaml.org,2002:set`,{create:()=>new Set,identify:e=>e instanceof Set,represent:e=>{let t=new Map;for(let n of e)t.set(n,null);return t},addPair:(e,t,n)=>n===null?(e.add(t),``):`cannot resolve a set item`,has:(e,t)=>e.has(t),keys:e=>e.keys(),get:()=>null});function pt(){return{scalar:Object.create(null),sequence:Object.create(null),mapping:Object.create(null)}}function mt(){return{scalar:[],sequence:[],mapping:[]}}function ht(e){let t=[];for(let n of e){let e=t.length;for(let r=0;r<t.length;r++){let i=t[r];if(i.nodeKind===n.nodeKind&&i.tagName===n.tagName&&i.matchByTagPrefix===n.matchByTagPrefix){e=r;break}}t[e]=n}return t}var gt=class e{tags;implicitScalarTags;implicitScalarByFirstChar;implicitScalarAnyFirstChar;defaultScalarTag;defaultSequenceTag;defaultMappingTag;exact;prefix;constructor(e){let t=ht(e),n=[],r=pt(),i=mt();for(let e of t){if(e.nodeKind===`scalar`&&e.implicit){if(e.matchByTagPrefix)throw Error(`Implicit scalar tags cannot match by tag prefix`);n.push(e)}switch(e.nodeKind){case`scalar`:e.matchByTagPrefix?i.scalar.push(e):r.scalar[e.tagName]=e;break;case`sequence`:e.matchByTagPrefix?i.sequence.push(e):r.sequence[e.tagName]=e;break;case`mapping`:e.matchByTagPrefix?i.mapping.push(e):r.mapping[e.tagName]=e}}let a=n.filter(e=>e.implicitFirstChars===null),o=new Set;for(let e of n)if(e.implicitFirstChars!==null)for(let t of e.implicitFirstChars)o.add(t);let s=new Map;for(let e of o)s.set(e,n.filter(t=>t.implicitFirstChars===null||t.implicitFirstChars.indexOf(e)!==-1));let c=r.scalar[`tag:yaml.org,2002:str`];if(!c)throw Error(`schema does not define the default scalar tag (tag:yaml.org,2002:str)`);this.tags=t,this.implicitScalarTags=n,this.implicitScalarByFirstChar=s,this.implicitScalarAnyFirstChar=a,this.defaultScalarTag=c,this.defaultSequenceTag=r.sequence[`tag:yaml.org,2002:seq`],this.defaultMappingTag=r.mapping[`tag:yaml.org,2002:map`],this.exact=r,this.prefix=i}lookupScalarTag(e){let t=this.exact.scalar[e];if(t)return t;for(let t of this.prefix.scalar)if(e.startsWith(t.tagName))return t}lookupSequenceTag(e){let t=this.exact.sequence[e];if(t)return t;for(let t of this.prefix.sequence)if(e.startsWith(t.tagName))return t}lookupMappingTag(e){let t=this.exact.mapping[e];if(t)return t;for(let t of this.prefix.mapping)if(e.startsWith(t.tagName))return t}resolveImplicitScalarTag(e){let t=this.implicitScalarByFirstChar.get(e.charAt(0))??this.implicitScalarAnyFirstChar;for(let n of t){let t=n.resolve(e,!1,n.tagName);if(t!==N)return{value:t,tag:n}}let n=this.defaultScalarTag;return{value:n.resolve(e,!1,n.tagName),tag:n}}withTags(...t){let n=[];for(let e of t)n=n.concat(e);return new e([...this.tags,...n])}},_t=new gt([oe,ot,dt]);new gt([..._t.tags,le,_e,Ae,We]);var vt=new gt([..._t.tags,ce,me,Te,ze]);new gt([..._t.tags,de,be,Pe,Ye,at,Xe,et,lt,ut,ft]).withTags({...Pe,resolve:(e,t,n)=>{let r=Pe.resolve(e,t,n);return r===N?Te.resolve(e,t,n):r}},{...Ye,resolve:(e,t,n)=>{let r=Ye.resolve(e,t,n);return r===N?ze.resolve(e,t,n):r}}),I(`tag:yaml.org,2002:map`,{create:()=>new Map,addPair:(e,t,n)=>(e.set(t,n),``),has:(e,t)=>e.has(t),keys:e=>e.keys(),get:(e,t)=>e.get(t),identify:e=>e instanceof Map||st(e),represent:e=>{if(e instanceof Map)return e;let t=new Map,n=e;for(let e of Object.keys(n))t.set(e,n[e]);return t}});function yt(e){if(Array.isArray(e)){let t=Array.prototype.slice.call(e);for(let e=0;e<t.length;e++){if(Array.isArray(t[e]))return null;typeof t[e]==`object`&&Object.prototype.toString.call(t[e])===`[object Object]`&&(t[e]=`[object Object]`)}return String(t)}return typeof e==`object`&&Object.prototype.toString.call(e)===`[object Object]`?`[object Object]`:String(e)}I(`tag:yaml.org,2002:map`,{create:()=>({}),identify:st,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{let r=yt(t);return r===null?`nested arrays are not supported inside keys`:(r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``)},has:(e,t)=>{let n=yt(t);return n!==null&&Object.prototype.hasOwnProperty.call(e,n)},keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}});var bt={maxLength:79,indent:1,linesBefore:3,linesAfter:2};function xt(e,t,n,r,i){let a=``,o=``,s=Math.floor(i/2)-1;return r-t>s&&(a=` ... `,t=r-s+a.length),n-r>s&&(o=` ...`,n=r+s-o.length),{str:a+e.slice(t,n).replace(/\t/g,`→`)+o,pos:r-t+a.length}}function St(e,t){return` `.repeat(Math.max(t-e.length,0))+e}function Ct(e,t){if(!e.buffer)return null;let n={...bt,...t},r=/\r?\n|\r|\0/g,i=[0],a=[],o,s=-1;for(;o=r.exec(e.buffer);)a.push(o.index),i.push(o.index+o[0].length),e.position<=o.index&&s<0&&(s=i.length-2);s<0&&(s=i.length-1);let c=``,l=Math.min(e.line+n.linesAfter,a.length).toString().length,u=n.maxLength-(n.indent+l+3);for(let t=1;t<=n.linesBefore&&!(s-t<0);t++){let r=xt(e.buffer,i[s-t],a[s-t],e.position-(i[s]-i[s-t]),u);c=`${` `.repeat(n.indent)}${St((e.line-t+1).toString(),l)} | ${r.str}\n${c}`}let d=xt(e.buffer,i[s],a[s],e.position,u);c+=`${` `.repeat(n.indent)}${St((e.line+1).toString(),l)} | ${d.str}\n`,c+=`${`-`.repeat(n.indent+l+3+d.pos)}^\n`;for(let t=1;t<=n.linesAfter&&!(s+t>=a.length);t++){let r=xt(e.buffer,i[s+t],a[s+t],e.position-(i[s]-i[s+t]),u);c+=`${` `.repeat(n.indent)}${St((e.line+t+1).toString(),l)} | ${r.str}\n`}return c.replace(/\n$/,``)}function wt(e,t){let n=``;return e.mark?(e.mark.name&&(n+=`in "${e.mark.name}" `),n+=`(${e.mark.line+1}:${e.mark.column+1})`,!t&&e.mark.snippet&&(n+=`\n\n${e.mark.snippet}`),`${e.reason} ${n}`):e.reason}var Tt=class e extends Error{reason;mark;constructor(e,t){super(),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=wt(this,!1),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}toString(e){return`${this.name}: ${wt(this,e)}`}static throwAt(t,n,r,i=``){let a=0,o=0;for(let e=0;e<n;e++){let n=t.charCodeAt(e);n===10?(a++,o=e+1):n===13&&(a++,t.charCodeAt(e+1)===10&&e++,o=e+1)}let s={name:i,buffer:t,position:n,line:a,column:n-o};throw s.snippet=Ct(s),new e(r,s)}},L={DOCUMENT:1,SEQUENCE:2,MAPPING:3,SCALAR:4,ALIAS:5,POP:6},R={PLAIN:1,SINGLE_QUOTED:2,DOUBLE_QUOTED:3,LITERAL_BLOCK:4,FOLDED_BLOCK:5},Et={BLOCK:1,FLOW:2},z={CLIP:1,STRIP:2,KEEP:3},Dt=-1;function Ot(e){switch(e){case 48:return`\0`;case 97:return`\x07`;case 98:return`\b`;case 116:return`	`;case 9:return`	`;case 110:return`
`;case 118:return`\v`;case 102:return`\f`;case 114:return`\r`;case 101:return`\x1B`;case 32:return` `;case 34:return`"`;case 47:return`/`;case 92:return`\\`;case 78:return``;case 95:return`\xA0`;case 76:return`\u2028`;case 80:return`\u2029`;default:return``}}var kt=Array(256),At=Array(256);for(let e=0;e<256;e++)kt[e]=+!!Ot(e),At[e]=Ot(e);function jt(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Mt(e){return e>=48&&e<=57?e-48:(e|32)-97+10}function Nt(e){return e===120?2:e===117?4:8}function Pt(e,t,n){let r=0;for(;t<n;){let n=e.charCodeAt(t);if(n===10)r++,t++;else if(n===13)r++,t++,e.charCodeAt(t)===10&&t++;else if(n===32||n===9)t++;else break}return{position:t,breaks:r}}function Ft(e){return e===1?` `:`
`.repeat(e-1)}function It(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===10||t===13){r+=e.slice(a,o);let t=Pt(e,i,n);r+=Ft(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,o)}function Lt(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===39)r+=e.slice(a,i)+`'`,i+=2,a=o=i;else if(t===10||t===13){r+=e.slice(a,o);let t=Pt(e,i,n);r+=Ft(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function Rt(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===92){r+=e.slice(a,i),i++;let t=e.charCodeAt(i);if(t===10||t===13)i=Pt(e,i,n).position;else if(t<256&&kt[t])r+=At[t],i++;else{let n=Nt(t),a=0;for(;n>0;n--){i++;let t=Mt(e.charCodeAt(i));a=(a<<4)+t}r+=jt(a),i++}a=o=i}else if(t===10||t===13){r+=e.slice(a,o);let t=Pt(e,i,n);r+=Ft(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function zt(e,t,n,r,i,a){let o=r<0?0:r,s=e.slice(t,n).replace(/\r\n?/g,`
`),c=s===``?[]:(s.endsWith(`
`)?s.slice(0,-1):s).split(`
`),l=``,u=!1,d=0,f=!1;for(let e of c){let t=0;for(;t<o&&e.charCodeAt(t)===32;)t++;if(r<0||t>=e.length){d++;continue}let n=e.slice(o),i=n.charCodeAt(0);a?i===32||i===9?(f=!0,l+=`
`.repeat(u?1+d:d)):f?(f=!1,l+=`
`.repeat(d+1)):d===0?u&&(l+=` `):l+=`
`.repeat(d):l+=`
`.repeat(u?1+d:d),l+=n,u=!0,d=0}return i===z.KEEP?l+=`
`.repeat(u?1+d:d):i!==z.STRIP&&u&&(l+=`
`),l}function Bt(e,t){if(t.valueStart===Dt)return``;let{valueStart:n,valueEnd:r}=t;if(t.fast)return e.slice(n,r);switch(t.style){case R.SINGLE_QUOTED:return Lt(e,n,r);case R.DOUBLE_QUOTED:return Rt(e,n,r);case R.LITERAL_BLOCK:return zt(e,n,r,t.indent,t.chomping,!1);case R.FOLDED_BLOCK:return zt(e,n,r,t.indent,t.chomping,!0);default:return It(e,n,r)}}var Vt=Object.assign(Object.create(null),{"!":`!`,"!!":`tag:yaml.org,2002:`});function Ht(e,t){if(e.startsWith(`!<`)&&e.endsWith(`>`))return decodeURIComponent(e.slice(2,-1));let n=e.indexOf(`!`,1),r=n===-1?`!`:e.slice(0,n+1),i=t?.[r]??Vt[r]??r;return decodeURIComponent(i)+decodeURIComponent(e.slice(r.length))}var Ut=-1,Wt=`tag:yaml.org,2002:merge`,Gt={filename:``,schema:vt,json:!1,maxTotalMergeKeys:1e4,maxAliases:-1};function Kt(e){return`tagStart`in e&&e.tagStart!==Ut?e.tagStart:`anchorStart`in e&&e.anchorStart!==Ut?e.anchorStart:`valueStart`in e&&e.valueStart!==Ut?e.valueStart:`start`in e?e.start:0}function B(e,t){Tt.throwAt(e.source,e.position,t,e.filename)}function qt(e,t,n,r){try{return n.finalize(r)}catch(n){if(n instanceof Tt)throw n;Tt.throwAt(e.source,t,n instanceof Error?n.message:String(n),e.filename)}}function Jt(e,t){let n=Bt(e.source,t),r=t.tagStart===Ut?``:e.source.slice(t.tagStart,t.tagEnd),i=e.schema.defaultScalarTag;if(r!==``){if(r===`!`)return{value:n,tag:i};let t=Ht(r,e.tagHandlers),a=e.schema.lookupScalarTag(t);if(a){let r=a.resolve(n,!0,t);return r===N&&B(e,`cannot resolve a node with !<${t}> explicit tag`),{value:r,tag:a}}let o=e.schema.lookupMappingTag(t)??e.schema.lookupSequenceTag(t);if(o){n!==``&&B(e,`cannot resolve a node with !<${t}> explicit tag`);let r=o.create(t);return{value:o.carrierIsResult?r:qt(e,e.position,o,r),tag:o}}B(e,`unknown scalar tag !<${t}>`)}return t.style===R.PLAIN?e.schema.resolveImplicitScalarTag(n):{value:i.resolve(n,!1,i.tagName),tag:i}}function Yt(e,t,n){let r=t.tagStart===Ut?``:e.source.slice(t.tagStart,t.tagEnd);return r===``||r===`!`?n:Ht(r,e.tagHandlers)}function Xt(e){return e.nodeKind===`mapping`}function Zt(e){e.totalMergeKeys++,e.maxTotalMergeKeys!==-1&&e.totalMergeKeys>e.maxTotalMergeKeys&&B(e,`merge keys exceeded maxTotalMergeKeys (${e.maxTotalMergeKeys})`)}function Qt(e,t,n,r){Zt(e);for(let i of r.keys(n)){if(Zt(e),t.tag.has(t.value,i))continue;let a=t.tag.addPair(t.value,i,r.get(n,i));a&&B(e,a),t.overridable??=new Set,t.overridable.add(i)}}function $t(e,t,n,r){if(e.position=t.keyPosition,Xt(r))Qt(e,t,n,r);else if(r.nodeKind===`sequence`&&Array.isArray(n)){n.length>100&&B(e,`abnormal merge sequence size`);for(let r of n){let n=e.nodeTags.get(r);n||B(e,`cannot merge mappings; the provided source object is unacceptable`),Qt(e,t,r,n)}}else B(e,`cannot merge mappings; the provided source object is unacceptable`)}function en(e,t,n,r,i){if(e.position=t.keyPosition,t.keyIsMerge){$t(e,t,r,i);return}!e.json&&t.tag.has(t.value,n)&&!t.overridable?.has(n)&&B(e,`duplicated mapping key`);let a=t.tag.addPair(t.value,n,r);a&&B(e,a),t.overridable?.delete(n)}function tn(e,t,n){let r=e.frames[e.frames.length-1];if(r.kind===`document`)r.value=t,r.hasValue=!0;else if(r.kind===`sequence`){Xt(n)&&e.nodeTags.set(t,n);let i=r.tag.addItem(r.value,t,r.index++);i&&B(e,i)}else if(r.hasKey){let i=r.key;r.key=void 0,r.hasKey=!1,en(e,r,i,t,n)}else r.key=t,r.keyPosition=e.position,r.hasKey=!0,r.keyIsMerge=n.tagName===Wt}function nn(e,t,n,r,i){if(t.anchorStart!==Ut){let a={value:n,tag:r,isValueFinal:i};return e.anchors.set(e.source.slice(t.anchorStart,t.anchorEnd),a),a}return null}function rn(e,t){let n={...Gt,...t,events:e,documents:[],eventIndex:0,position:0,frames:[],anchors:new Map,nodeTags:new Map,tagHandlers:Object.create(null),totalMergeKeys:0,aliasCount:0};for(;n.eventIndex<n.events.length;){let e=n.events[n.eventIndex++];switch(n.position=Kt(e),e.type){case L.DOCUMENT:n.anchors=new Map,n.nodeTags=new Map,n.aliasCount=0,n.tagHandlers=Object.create(null);for(let t of e.directives)t.kind===`tag`&&(n.tagHandlers[t.handle]=t.prefix);n.frames.push({kind:`document`,position:n.position,value:void 0,hasValue:!1});break;case L.SCALAR:{let{value:t,tag:r}=Jt(n,e);nn(n,e,t,r,!0),tn(n,t,r);break}case L.SEQUENCE:{let t=Yt(n,e,`tag:yaml.org,2002:seq`),r=n.schema.lookupSequenceTag(t);r||B(n,`unknown sequence tag !<${t}>`);let i=r.create(t),a=nn(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`sequence`,position:n.position,value:i,tag:r,anchor:a,index:0});break}case L.MAPPING:{let t=Yt(n,e,`tag:yaml.org,2002:map`),r=n.schema.lookupMappingTag(t);r||B(n,`unknown mapping tag !<${t}>`);let i=r.create(t),a=nn(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`mapping`,position:n.position,value:i,tag:r,anchor:a,key:void 0,keyPosition:n.position,hasKey:!1,keyIsMerge:!1,overridable:null});break}case L.ALIAS:{n.maxAliases!==-1&&++n.aliasCount>n.maxAliases&&B(n,`aliases exceeded maxAliases (${n.maxAliases})`);let t=n.source.slice(e.anchorStart,e.anchorEnd),r=n.anchors.get(t);r||B(n,`unidentified alias "${t}"`),r.isValueFinal||B(n,`recursive alias "${t}" is not supported for tag ${r.tag.tagName} because it uses finalize()`),tn(n,r.value,r.tag);break}case L.POP:{let e=n.frames.pop();if(e.kind===`mapping`&&e.hasKey&&(n.position=e.keyPosition,B(n,`incomplete mapping pair in event stream`)),e.kind===`document`)n.documents.push(e.value);else{let t=e.tag.carrierIsResult?e.value:qt(n,e.position,e.tag,e.value);e.anchor&&(e.anchor.value=t,e.anchor.isValueFinal=!0),tn(n,t,e.tag)}break}}}return n.documents}var V=-1,an=Object.prototype.hasOwnProperty,on=1,sn=2,cn=3,ln=4,un=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,dn=/[,\[\]{}]/,fn=/^(?:!|!!|![0-9A-Za-z-]+!)$/,pn=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`,mn=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`,hn=RegExp(`^(?:${pn})*$`),gn=RegExp(`^(?:${mn})+$`),_n=RegExp(`^(?:!(?:${pn})*|${mn}(?:${pn})*)$`),vn={filename:``,maxDepth:100};function yn(e,t,n){e.events.push({type:L.DOCUMENT,explicitStart:t,explicitEnd:n,directives:e.directives})}function bn(e,t,n,r,i,a,o){e.events.push({type:L.SEQUENCE,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function xn(e,t,n,r,i,a,o){e.events.push({type:L.MAPPING,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function Sn(e,t){e.events.splice(t.eventsLength,0,{type:L.MAPPING,start:t.position,anchorStart:V,anchorEnd:V,tagStart:V,tagEnd:V,style:Et.FLOW})}function Cn(e,t,n,r,i,a,o,s,c=z.CLIP,l=-1,u=!1){e.events.push({type:L.SCALAR,valueStart:t,valueEnd:n,anchorStart:r,anchorEnd:i,tagStart:a,tagEnd:o,style:s,chomping:c,indent:l,fast:u})}function wn(e,t,n){e.events.push({type:L.ALIAS,anchorStart:t,anchorEnd:n})}function Tn(e){e.events.push({type:L.POP})}function H(e){Cn(e,V,V,V,V,V,V,R.PLAIN)}function En(){return{anchorStart:V,anchorEnd:V,tagStart:V,tagEnd:V}}function Dn(e){return{position:e.position,line:e.line,lineStart:e.lineStart,lineIndent:e.lineIndent,firstTabInLine:e.firstTabInLine,eventsLength:e.events.length}}function On(e,t){e.position=t.position,e.line=t.line,e.lineStart=t.lineStart,e.lineIndent=t.lineIndent,e.firstTabInLine=t.firstTabInLine,e.events.length=t.eventsLength}function U(e,t){Tt.throwAt(e.input.slice(0,e.length),e.position,t,e.filename)}function W(e){return e===10||e===13}function kn(e){return e===9||e===32}function G(e){return kn(e)||W(e)}function K(e){return e===0||G(e)}function An(e){return e===44||e===91||e===93||e===123||e===125}function jn(e){return e>=48&&e<=57?e-48:-1}function Mn(e){if(e>=48&&e<=57)return e-48;let t=e|32;return t>=97&&t<=102?t-97+10:-1}function Nn(e){return e===120?2:e===117?4:e===85?8:0}function Pn(e){return e===48||e===97||e===98||e===116||e===9||e===110||e===118||e===102||e===114||e===101||e===32||e===34||e===47||e===92||e===78||e===95||e===76||e===80}function Fn(e){e.input.charCodeAt(e.position)===10?e.position++:(e.position++,e.input.charCodeAt(e.position)===10&&e.position++),e.line++,e.lineStart=e.position,e.lineIndent=0,e.firstTabInLine=-1}function q(e,t){let n=0,r=e.input.charCodeAt(e.position),i=e.position===e.lineStart||G(e.input.charCodeAt(e.position-1));for(;r!==0;){for(;kn(r);)i=!0,r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&i&&r===35)do r=e.input.charCodeAt(++e.position);while(!W(r)&&r!==0);if(!W(r))break;for(Fn(e),n++,i=!0,r=e.input.charCodeAt(e.position);r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position)}return n}function In(e,t=e.position){let n=e.input.charCodeAt(t);if((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)){let n=e.input.charCodeAt(t+3);return n===0||G(n)}return!1}function Ln(e){e.position===e.lineStart&&e.input.charCodeAt(e.position)===65279&&(e.position++,e.lineStart=e.position)}function Rn(e){if(e.position!==e.lineStart)return!1;if(In(e))return!0;if(e.input.charCodeAt(e.position)!==65279)return!1;let t=Dn(e);Ln(e),q(e,!0);let n=e.input.charCodeAt(e.position),r=e.position===e.lineStart&&(n===37||n===45&&In(e));return On(e,t),r}function zn(e){let t=e.input.charCodeAt(e.position);for(;t!==0&&!W(t);)t=e.input.charCodeAt(++e.position)}function Bn(e,t,n){un.test(e.input.slice(t,n))&&U(e,`the stream contains non-printable characters`)}function Vn(e,t,n){if(e.input.charCodeAt(e.position)!==33)return!1;t.tagStart!==V&&U(e,`duplication of a tag property`);let r=e.position,i=!1,a=!1,o=`!`,s=e.input.charCodeAt(++e.position);s===60?(i=!0,s=e.input.charCodeAt(++e.position)):s===33&&(a=!0,o=`!!`,s=e.input.charCodeAt(++e.position));let c=e.position,l;if(i){for(;s!==0&&s!==62;)s=e.input.charCodeAt(++e.position);s!==62&&U(e,`unexpected end of the stream within a verbatim tag`),l=e.input.slice(c,e.position),e.position++}else{for(;s!==0&&!G(s)&&!(n&&An(s));)s===33&&(a?U(e,`tag suffix cannot contain exclamation marks`):(o=e.input.slice(c-1,e.position+1),fn.test(o)||U(e,`named tag handle cannot contain such characters`),a=!0,c=e.position+1)),s=e.input.charCodeAt(++e.position);l=e.input.slice(c,e.position),dn.test(l)&&U(e,`tag suffix cannot contain flow indicator characters`)}return l&&!(i?hn.test(l):gn.test(l))&&U(e,`tag name cannot contain such characters: ${l}`),!i&&o!==`!`&&o!==`!!`&&!an.call(e.tagHandlers,o)&&U(e,`undeclared tag handle "${o}"`),t.tagStart=r,t.tagEnd=e.position,!0}function Hn(e,t){if(e.input.charCodeAt(e.position)!==38)return!1;t.anchorStart!==V&&U(e,`duplication of an anchor property`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!G(e.input.charCodeAt(e.position))&&!An(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&U(e,`name of an anchor node must contain at least one character`),t.anchorStart=n,t.anchorEnd=e.position,!0}function Un(e,t){if(e.input.charCodeAt(e.position)!==42)return!1;(t.anchorStart!==V||t.tagStart!==V)&&U(e,`alias node should not have any properties`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!G(e.input.charCodeAt(e.position))&&!An(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&U(e,`name of an alias node must contain at least one character`),wn(e,n,e.position),!0}function Wn(e,t){q(e,!1),e.lineIndent<t&&U(e,`deficient indentation`)}function Gn(e,t,n){if(e.input.charCodeAt(e.position)!==39)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===39){if(e.input.charCodeAt(e.position+1)===39){i=!1,e.position+=2;continue}let t=e.position;return e.position++,Cn(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,R.SINGLE_QUOTED,z.CLIP,-1,i),!0}W(a)?(i=!1,Wn(e,t)):e.position===e.lineStart&&In(e)?U(e,`unexpected end of the document within a single quoted scalar`):a!==9&&a<32?U(e,`expected valid JSON character`):e.position++}U(e,`unexpected end of the stream within a single quoted scalar`)}function Kn(e,t,n){if(e.input.charCodeAt(e.position)!==34)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===34){let t=e.position;return e.position++,Cn(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,R.DOUBLE_QUOTED,z.CLIP,-1,i),!0}if(a===92){i=!1;let n=e.input.charCodeAt(++e.position);if(W(n))Wn(e,t);else if(Pn(n))e.position++;else{let t=Nn(n);for(t===0&&U(e,`unknown escape sequence`);t-->0;)e.position++,Mn(e.input.charCodeAt(e.position))<0&&U(e,`expected hexadecimal character`);e.position++}}else W(a)?(i=!1,Wn(e,t)):e.position===e.lineStart&&In(e)?U(e,`unexpected end of the document within a double quoted scalar`):a!==9&&a<32?U(e,`expected valid JSON character`):e.position++}U(e,`unexpected end of the stream within a double quoted scalar`)}function qn(e,t,n){let r=e.input.charCodeAt(e.position),i=z.CLIP,a=-1,o=!1;if(r!==124&&r!==62)return!1;let s=r===124?R.LITERAL_BLOCK:R.FOLDED_BLOCK;for(e.position++;e.input.charCodeAt(e.position)!==0;){let n=e.input.charCodeAt(e.position),r=jn(n);if(n===43||n===45)i!==z.CLIP&&U(e,`repeat of a chomping mode identifier`),i=n===43?z.KEEP:z.STRIP,e.position++;else if(r>=0)r===0&&U(e,`bad explicit indentation width of a block scalar; it cannot be less than one`),o&&U(e,`repeat of an indentation width identifier`),a=t+r-1,o=!0,e.position++;else break}let c=!1;for(;kn(e.input.charCodeAt(e.position));)c=!0,e.position++;c&&e.input.charCodeAt(e.position)===35&&zn(e),W(e.input.charCodeAt(e.position))?Fn(e):e.input.charCodeAt(e.position)!==0&&U(e,`a line break is expected`);let l=o?a:-1,u=0,d=e.position,f=e.position;for(;e.input.charCodeAt(e.position)!==0;){let n=e.position,r=0;for(;e.input.charCodeAt(n+r)===32;)r++;let i=e.input.charCodeAt(n+r);if(i===0){l>=0?r>l&&(f=n+r):r>0&&(f=n+r);break}if(Rn(e))break;if(!o&&l===-1&&W(i)&&(u=Math.max(u,r)),!o&&l===-1&&!W(i)&&(i===9&&r<t&&(e.position=n+r,U(e,`tab characters must not be used in indentation`)),r<u&&(e.position=n+r,U(e,`bad indentation of a mapping entry`))),l===-1&&i!==0&&!W(i)&&r<t){e.lineIndent=r,e.position=n+r;break}!o&&i!==0&&!W(i)&&l===-1&&(l=r);let a=l===-1?t+1:l;if(i!==0&&!W(i)&&r<a){e.lineIndent=r,e.position=n+r;break}zn(e),f=e.position,W(e.input.charCodeAt(e.position))&&(Fn(e),f=e.position)}return Bn(e,d,f),Cn(e,d,f,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,s,i,l),!0}function Jn(e,t){let n=e.input.charCodeAt(e.position),r=t===on;if(n===0||G(n)||n===35||n===38||n===42||n===33||n===124||n===62||n===39||n===34||n===37||n===64||n===96||r&&An(n))return!1;if(n===63||n===45){let t=e.input.charCodeAt(e.position+1);if(K(t)||r&&An(t))return!1}return!0}function Yn(e,t,n,r){if(!Jn(e,n))return!1;let i=e.position,a=e.position,o=e.input.charCodeAt(e.position),s=n===on,c=!1;for(;o!==0&&!Rn(e);){if(o===58){let t=e.input.charCodeAt(e.position+1);if(K(t)||s&&An(t))break}else if(o===35){if(G(e.input.charCodeAt(e.position-1)))break}else if(s&&An(o))break;else if(W(o)){let n=e.position,r=e.line,i=e.lineStart,a=e.lineIndent;if(q(e,!1),e.lineIndent>=t){c=!0,o=e.input.charCodeAt(e.position);continue}e.position=n,e.line=r,e.lineStart=i,e.lineIndent=a;break}kn(o)||(a=e.position+1),o=e.input.charCodeAt(++e.position)}return a!==i&&(Bn(e,i,a),Cn(e,i,a,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,R.PLAIN,z.CLIP,-1,!c),!0)}function Xn(e,t){let n=e.line;q(e,!0),(e.line>n&&e.lineIndent<t||e.firstTabInLine!==-1&&e.lineIndent<t)&&U(e,`deficient indentation`)}function Zn(e,t,n){let r=e.input.charCodeAt(e.position),i=r===123,a=e.position,o=!0;if(r!==91&&r!==123)return!1;let s=i?125:93;for(i?xn(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,Et.FLOW):bn(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,Et.FLOW),e.position++;e.input.charCodeAt(e.position)!==0;){Xn(e,t);let n=e.input.charCodeAt(e.position);if(n===s)return e.position++,Tn(e),!0;o?n===44&&U(e,`expected the node content, but found ','`):U(e,`missed comma between flow collection entries`);let r=!1,a=!1;n===63&&G(e.input.charCodeAt(e.position+1))&&(r=a=!0,e.position+=1,Xn(e,t));let c=e.line,l=Dn(e),u=er(e,t,on,!1,!0);Xn(e,t),n=e.input.charCodeAt(e.position),(i||a||e.line===c)&&n===58?(r=!0,e.position++,Xn(e,t),i||Sn(e,l),u||H(e),er(e,t,on,!1,!0)||H(e),Xn(e,t),i||Tn(e)):i&&r?(u||H(e),H(e)):i?H(e):r&&(Sn(e,l),u||H(e),H(e),Tn(e)),n=e.input.charCodeAt(e.position),n===44?(o=!0,e.position++):o=!1}U(e,`unexpected end of the stream within a flow collection`)}function Qn(e,t,n){if(e.firstTabInLine!==-1||e.input.charCodeAt(e.position)!==45||!K(e.input.charCodeAt(e.position+1)))return!1;for(bn(e,e.position,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,Et.BLOCK);e.input.charCodeAt(e.position)===45&&K(e.input.charCodeAt(e.position+1));){e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,U(e,`tab characters must not be used in indentation`));let n=e.line;e.position++;let r=q(e,!0)>0;if(e.firstTabInLine!==-1&&e.input.charCodeAt(e.position)===45&&K(e.input.charCodeAt(e.position+1))&&U(e,`bad indentation of a sequence entry`),r&&e.lineIndent<=t?H(e):er(e,t,cn,!1,!0),q(e,!0),e.lineIndent<t||e.position>=e.length)break;e.lineIndent>t&&U(e,`bad indentation of a sequence entry`),e.line===n&&e.input.charCodeAt(e.position)===45&&K(e.input.charCodeAt(e.position+1))&&U(e,`bad indentation of a sequence entry`)}return Tn(e),!0}function $n(e,t,n,r){let i=!1,a=!1,o=!1,s=!1;if(e.firstTabInLine!==-1)return!1;let c=e.input.charCodeAt(e.position);for(;c!==0;){!i&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,U(e,`tab characters must not be used in indentation`));let l=e.input.charCodeAt(e.position+1),u=e.line;if((c===63||c===58)&&K(l))o||=(xn(e,e.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,Et.BLOCK),!0),c===63?(i&&H(e),a=!0,i=!0):i?i=!1:(H(e),a=!0,i=!1),e.position+=1,s=!0;else{i&&=(H(e),!1);let t=Dn(e);if(!er(e,n,sn,!1,!0))break;if(e.line===u){for(c=e.input.charCodeAt(e.position);kn(c);)c=e.input.charCodeAt(++e.position);if(c===58){if(c=e.input.charCodeAt(++e.position),K(c)||U(e,`a whitespace character is expected after the key-value separator within a block mapping`),!o){for(On(e,t),xn(e,t.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,Et.BLOCK),o=!0,er(e,n,sn,!1,!0),c=e.input.charCodeAt(e.position);kn(c);)c=e.input.charCodeAt(++e.position);e.position++}a=!0,i=!1,s=!1}else if(a)U(e,`expected ':' after a mapping key`);else return r.anchorStart!==V||r.tagStart!==V?(On(e,t),!1):!0}else if(a)U(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return r.anchorStart!==V||r.tagStart!==V?(On(e,t),!1):!0}if(er(e,t,ln,!0,s)&&(s=!1),i||(s&&=(H(e),!1)),q(e,!0),c=e.input.charCodeAt(e.position),(e.line===u||e.lineIndent>t)&&c!==0)U(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return a?(i&&H(e),o&&Tn(e),!0):!1}function er(e,t,n,r,i,a=!0){e.depth>=e.maxDepth&&U(e,`nesting exceeded maxDepth (${e.maxDepth})`),e.depth++;let o=1,s=!1,c=!1,l=null,u=En(),d=n===ln||n===cn,f=d,p=d;if(r&&q(e,!0)&&(s=!0,o=e.lineIndent>t?1:e.lineIndent===t?0:-1),o===1)for(;;){let r=e.input.charCodeAt(e.position),i=Dn(e);if(s&&o!==1&&(r===33||r===38))break;if(s&&p&&(u.tagStart!==V||u.anchorStart!==V)&&(r===33||r===38)){let n=Dn(e),r=t+1;if($n(e,e.position-e.lineStart,r,u)&&e.events[n.eventsLength]?.type===L.MAPPING)return e.depth--,!0;On(e,n)}if(s&&(r===33&&u.tagStart!==V||r===38&&u.anchorStart!==V)||!Vn(e,u,n===on)&&!Hn(e,u))break;l===null&&(l=i),q(e,!0)?(s=!0,f=p,o=e.lineIndent>t?1:e.lineIndent===t?0:-1):f=!1}if(f&&=s||i,o===1||n===ln){let r=n===on||n===sn?t:t+1,i=e.position-e.lineStart;if(o===1){if(f&&(Qn(e,i,u)||$n(e,i,r,u))||Zn(e,r,u))c=!0;else{let t=e.input.charCodeAt(e.position);if(l!==null&&a&&p&&!f&&t!==124&&t!==62){let t=Dn(e),n=l.position-l.lineStart;On(e,l),$n(e,n,r,En())&&e.events[t.eventsLength]?.type===L.MAPPING?c=!0:On(e,t)}!c&&(d&&qn(e,r,u)||Gn(e,r,u)||Kn(e,r,u)||Un(e,u)||Yn(e,r,n,u))&&(c=!0)}}else o===0&&(c=f&&Qn(e,i,u))}return d&&=!c,!c&&(u.anchorStart!==V||u.tagStart!==V||d)&&(Cn(e,V,V,u.anchorStart,u.anchorEnd,u.tagStart,u.tagEnd,R.PLAIN),c=!0),e.depth--,c||u.anchorStart!==V||u.tagStart!==V}function tr(e){if(e.lineIndent>0||e.input.charCodeAt(e.position)!==37)return!1;e.position++;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!G(e.input.charCodeAt(e.position));)e.position++;let n=e.input.slice(t,e.position),r=[];for(n.length===0&&U(e,`directive name must not be less than one character in length`);e.input.charCodeAt(e.position)!==0&&!W(e.input.charCodeAt(e.position));){for(;kn(e.input.charCodeAt(e.position));)e.position++;if(e.input.charCodeAt(e.position)===35||W(e.input.charCodeAt(e.position))||e.input.charCodeAt(e.position)===0)break;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!G(e.input.charCodeAt(e.position));)e.position++;r.push(e.input.slice(t,e.position))}if(W(e.input.charCodeAt(e.position))&&Fn(e),n===`YAML`){e.directives.some(e=>e.kind===`yaml`)&&U(e,`duplication of %YAML directive`),r.length!==1&&U(e,`YAML directive accepts exactly one argument`);let t=/^([0-9]+)\.([0-9]+)$/.exec(r[0]);t===null&&U(e,`ill-formed argument of the YAML directive`),parseInt(t[1],10)!==1&&U(e,`unacceptable YAML version of the document`),e.directives.push({kind:`yaml`,version:r[0]})}else if(n===`TAG`){r.length!==2&&U(e,`TAG directive accepts exactly two arguments`);let[t,n]=r;fn.test(t)||U(e,`ill-formed tag handle (first argument) of the TAG directive`),an.call(e.tagHandlers,t)&&U(e,`there is a previously declared suffix for "${t}" tag handle`),_n.test(n)||U(e,`ill-formed tag prefix (second argument) of the TAG directive`),e.tagHandlers[t]=n,e.directives.push({kind:`tag`,handle:t,prefix:n})}return!0}function nr(e){e.directives=[],e.tagHandlers=Object.create(null);let t=!1;for(q(e,!0);tr(e);)t=!0,q(e,!0);let n=!1,r=!1,i=!0;if(e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45&&K(e.input.charCodeAt(e.position+3))){n=!0;let t=e.line;e.position+=3,q(e,!0),i=e.line>t}else t&&U(e,`directives end mark is expected`);let a=e.events.length;if(!n&&e.position===e.lineStart&&e.input.charCodeAt(e.position)===46&&In(e)){e.position+=3,q(e,!0);return}if(yn(e,n,!1),er(e,e.lineIndent-1,ln,!1,i,i)||H(e),q(e,!0),e.position===e.lineStart&&In(e)&&(r=e.input.charCodeAt(e.position)===46,r)){let t=e.line;e.position+=3,q(e,!0),e.line===t&&e.position<e.length&&U(e,`end of the stream or a document separator is expected`)}let o=e.events[a];o?.type===L.DOCUMENT&&(o.explicitEnd=r),Tn(e),!r&&e.position<e.length&&!Rn(e)&&U(e,`end of the stream or a document separator is expected`)}function rr(e,t){let n=e.length,r={...vn,...t,input:`${e}\0`,length:n,position:0,line:0,lineStart:0,lineIndent:0,firstTabInLine:-1,depth:0,directives:[],tagHandlers:Object.create(null),events:[]},i=e.indexOf(`\0`);for(i!==-1&&Tt.throwAt(e,i,`null byte is not allowed in input`,r.filename);r.position<r.length&&(Ln(r),q(r,!0),!(r.position>=r.length));){let e=r.position;nr(r),r.position===e&&U(r,`can not read a document`)}return r.events}var ir={...vn,...Gt};function ar(e,t={}){let n={...ir,...t},r=String(e),i=Object.keys(vn),a=Object.keys(Gt);return rn(rr(r,ct(n,i)),{...ct(n,a),source:r})}function or(e,t){let n=ar(e,t);if(n.length===0)throw new Tt(`expected a document, but the input is empty`);if(n.length===1)return n[0];throw new Tt(`expected a single document in the stream, but found more`)}function sr(e,t){return!!(e&1<<t)}var cr={applyQuoteFlowKeysOption:ur,doubleQuoteForInvisibles:dr,doubleQuoteWhitespaceOnly:fr,applyForceQuotesOption:pr,tryLongOrMultilineAsBlock:mr,quoteInvalidPlain:hr,fallbackToDoubleQuoted:gr};function lr(e){return e.presenterOptions.quoteStyle===`single`&&sr(e.allowedStylesMask,R.SINGLE_QUOTED)?R.SINGLE_QUOTED:R.DOUBLE_QUOTED}function ur(e){e.presenterOptions.quoteFlowKeys&&e.isKey&&e.flowOnly&&e.style===R.PLAIN&&(e.style=R.DOUBLE_QUOTED)}function dr(e){e.style===R.PLAIN&&/[\t\x7F-\xA0\u2028\u2029\uFEFF\uFFFE\uFFFF]/.test(e.node.value)&&(e.style=R.DOUBLE_QUOTED)}function fr(e){e.style===R.PLAIN&&/^\s+$/.test(e.node.value)&&(e.style=R.DOUBLE_QUOTED)}function pr(e){e.presenterOptions.forceQuotes&&(e.isKey||e.style!==R.PLAIN||e.node.tag===e.presenterOptions.schema.defaultScalarTag.tagName&&(e.style=e.node.value.includes(`
`)?R.DOUBLE_QUOTED:lr(e)))}function mr(e){if(e.style!==R.PLAIN||e.isKey)return;let t=e.node.value,n=t.indexOf(`
`)!==-1;if(!sr(e.allowedStylesMask,R.LITERAL_BLOCK)){n&&(e.style=R.DOUBLE_QUOTED);return}let r=e.presenterOptions.lineWidth;if(r===-1){n&&(e.style=R.LITERAL_BLOCK);return}let i=Math.max(Math.min(r,40),r-e.shiftOfContent),a=0,o=!1;for(;a<=t.length;){let e=t.length,n=t.indexOf(`
`,a);n!==-1&&(e=n);let r=t.slice(a,e);if(r.length>i&&r[0]!==` `&&/ [^ \t]/.test(r)&&(o=!0),n===-1)break;a=n+1}o?e.style=R.FOLDED_BLOCK:n&&(e.style=R.LITERAL_BLOCK)}function hr(e){e.style===R.PLAIN&&!sr(e.allowedStylesMask,R.PLAIN)&&(e.style=lr(e))}function gr(e){sr(e.allowedStylesMask,e.style)||(e.style=R.DOUBLE_QUOTED)}var _r=`[\\x09\\x0A\\x0D\\x20-\\x7E\\x85\\xA0-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]`,vr=`[\\n\\r]`,yr=`\\uFEFF`,br=`[ \\t]`,xr=`(?:(?!(?:${vr}|${yr}))${_r})`,Sr=`(?:(?!${br})${xr})`,Cr=`[\\x09\\x20-\\uD7FF\\uE000-\\uFFFF\\u{10000}-\\u{10FFFF}]`,wr=`[-?:,\\[\\]{}#&*!|>'"%@\`]`,Tr=`[,\\[\\]{}]`,Er=Sr,Dr=`(?:(?!${Tr})${Sr})`,Or=`(?:(?:(?!${wr})${Sr})|[?:-](?=${Er}))`,kr=`(?:(?:(?!${wr})${Sr})|[?:-](?=${Dr}))`,Ar=`(?:(?:(?![:#])${Er})|:(?=${Er}))#*`,jr=`(?:(?:(?![:#])${Dr})|:(?=${Dr}))#*`,Mr=`(?:${br}*${Ar})*`,Nr=`(?:${br}*${jr})*`,Pr=`${Or}#*${Mr}`,Fr=`${kr}#*${Nr}`,Ir=Pr,Lr=Fr,Rr=`\\n+${Ar}${Mr}`,zr=`\\n+${jr}${Nr}`,Br=`${Pr}(?:${Rr})*`,Vr=`${Fr}(?:${zr})*`;RegExp(`^(?:${Br})$`,`u`),RegExp(`^(?:${Vr})$`,`u`),RegExp(`^(?:${Ir})$`,`u`),RegExp(`^(?:${Lr})$`,`u`),RegExp(`^(?:${Cr})*$`,`u`),RegExp(`^(?:${Cr}|\\n)*$`,`u`),RegExp(`^(?:${xr}|\\n)*$`,`u`),Object.keys(cr).map(e=>Reflect.get(cr,e)),L.DOCUMENT,L.SEQUENCE,L.MAPPING,L.SCALAR,L.ALIAS,L.POP,R.PLAIN,R.SINGLE_QUOTED,R.DOUBLE_QUOTED,R.LITERAL_BLOCK,R.FOLDED_BLOCK,Et.BLOCK,Et.FLOW,z.CLIP,z.STRIP,z.KEEP;var Hr=Object.assign({"./data/song_metadata/Alan Wake.yaml":ee,"./data/song_metadata/Anime.yaml":S,"./data/song_metadata/Attacking Titan.yaml":C,"./data/song_metadata/Dark Souls.yaml":w,"./data/song_metadata/Disturbed.yaml":T,"./data/song_metadata/E33 (Curated).yaml":te,"./data/song_metadata/E33.yaml":E,"./data/song_metadata/Elden Ring.yaml":ne,"./data/song_metadata/Games.yaml":D,"./data/song_metadata/Last of Us.yaml":O,"./data/song_metadata/Miscellaneous.yaml":k,"./data/song_metadata/Nostalgic.yaml":A,"./data/song_metadata/Rage Against the Machine.yaml":j,"./data/song_metadata/Workout.yaml":re}),Ur=Object.assign({"./data/manual_playlists/E33 (Curated).yaml":ie,"./data/manual_playlists/E33.yaml":M,"./data/manual_playlists/Workout.yaml":ae});function Wr(e){let t=e.slice(e.lastIndexOf(`/`)+1),n=t.lastIndexOf(`.`);return n>0?t.slice(0,n):t}function Gr(e){return e.trim()===``?[]:or(e)??[]}function Kr(e){return Object.entries(e).sort(([e],[t])=>e<t?-1:+(e>t))}function qr(e,t){let r=[];for(let[t,i]of Kr(e))r.push(...n(Wr(t),Gr(i)));let i=new Map;for(let[e,n]of Kr(t))i.set(Wr(e),Gr(n).map(e=>String(e)));return{songs:r,playlists:c(r,i),manualPlaylists:i}}var Jr;function Yr(){return Jr??=qr(Hr,Ur),Jr}var Xr=`music-app`,Zr=`folders`,Qr=`music`;function $r(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}function ei(){let e=indexedDB.open(Xr,1);return e.onupgradeneeded=()=>e.result.createObjectStore(Zr),$r(e)}async function ti(e,t){let n=await ei();try{return await $r(t(n.transaction(Zr,e).objectStore(Zr)))}finally{n.close()}}var ni={async get(){return await ti(`readonly`,e=>e.get(Qr))??null},async set(e){await ti(`readwrite`,t=>t.put(e,Qr))},async clear(){await ti(`readwrite`,e=>e.delete(Qr))}};async function ri(e=ni){try{return await e.get()}catch{return null}}async function ii(e,t=ni){try{await t.set(e)}catch{}}async function ai(e=ni){try{await e.clear()}catch{}}async function oi(e){let t=e,n={mode:`readwrite`};return t.queryPermission===void 0||await t.queryPermission(n)===`granted`||await t.requestPermission?.(n)===`granted`}var J=Uint8Array,Y=Uint16Array,si=Int32Array,ci=new J([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),li=new J([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),ui=new J([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),di=function(e,t){for(var n=new Y(31),r=0;r<31;++r)n[r]=t+=1<<e[r-1];for(var i=new si(n[30]),r=1;r<30;++r)for(var a=n[r];a<n[r+1];++a)i[a]=a-n[r]<<5|r;return{b:n,r:i}},fi=di(ci,2),pi=fi.b,mi=fi.r;pi[28]=258,mi[258]=28;var hi=di(li,0);hi.b;for(var gi=hi.r,_i=new Y(32768),X=0;X<32768;++X){var vi=(X&43690)>>1|(X&21845)<<1;vi=(vi&52428)>>2|(vi&13107)<<2,vi=(vi&61680)>>4|(vi&3855)<<4,_i[X]=((vi&65280)>>8|(vi&255)<<8)>>1}for(var yi=(function(e,t,n){for(var r=e.length,i=0,a=new Y(t);i<r;++i)e[i]&&++a[e[i]-1];var o=new Y(t);for(i=1;i<t;++i)o[i]=o[i-1]+a[i-1]<<1;var s;if(n){s=new Y(1<<t);var c=15-t;for(i=0;i<r;++i)if(e[i])for(var l=i<<4|e[i],u=t-e[i],d=o[e[i]-1]++<<u,f=d|(1<<u)-1;d<=f;++d)s[_i[d]>>c]=l}else for(s=new Y(r),i=0;i<r;++i)e[i]&&(s[i]=_i[o[e[i]-1]++]>>15-e[i]);return s}),bi=new J(288),X=0;X<144;++X)bi[X]=8;for(var X=144;X<256;++X)bi[X]=9;for(var X=256;X<280;++X)bi[X]=7;for(var X=280;X<288;++X)bi[X]=8;for(var xi=new J(32),X=0;X<32;++X)xi[X]=5;var Si=yi(bi,9,0),Ci=yi(xi,5,0),wi=function(e){return(e+7)/8|0},Ti=function(e,t,n){return(t==null||t<0)&&(t=0),(n==null||n>e.length)&&(n=e.length),new J(e.subarray(t,n))},Ei=[`unexpected EOF`,`invalid block type`,`invalid length/literal`,`invalid distance`,`stream finished`,`no stream handler`,,`no callback`,`invalid UTF-8 data`,`extra field too long`,`date not in range 1980-2099`,`filename too long`,`stream finishing`,`invalid zip data`],Di=function(e,t,n){var r=Error(t||Ei[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,Di),!n)throw r;return r},Oi=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8},ki=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8,e[r+2]|=n>>16},Ai=function(e,t){for(var n=[],r=0;r<e.length;++r)e[r]&&n.push({s:r,f:e[r]});var i=n.length,a=n.slice();if(!i)return{t:Li,l:0};if(i==1){var o=new J(n[0].s+1);return o[n[0].s]=1,{t:o,l:1}}n.sort(function(e,t){return e.f-t.f}),n.push({s:-1,f:25001});var s=n[0],c=n[1],l=0,u=1,d=2;for(n[0]={s:-1,f:s.f+c.f,l:s,r:c};u!=i-1;)s=n[n[l].f<n[d].f?l++:d++],c=n[l!=u&&n[l].f<n[d].f?l++:d++],n[u++]={s:-1,f:s.f+c.f,l:s,r:c};for(var f=a[0].s,r=1;r<i;++r)a[r].s>f&&(f=a[r].s);var p=new Y(f+1),m=ji(n[u-1],p,0);if(m>t){var r=0,h=0,g=m-t,_=1<<g;for(a.sort(function(e,t){return p[t.s]-p[e.s]||e.f-t.f});r<i;++r){var v=a[r].s;if(p[v]>t)h+=_-(1<<m-p[v]),p[v]=t;else break}for(h>>=g;h>0;){var y=a[r].s;p[y]<t?h-=1<<t-p[y]++-1:++r}for(;r>=0&&h;--r){var b=a[r].s;p[b]==t&&(--p[b],++h)}m=t}return{t:new J(p),l:m}},ji=function(e,t,n){return e.s==-1?Math.max(ji(e.l,t,n+1),ji(e.r,t,n+1)):t[e.s]=n},Mi=function(e){for(var t=e.length;t&&!e[--t];);for(var n=new Y(++t),r=0,i=e[0],a=1,o=function(e){n[r++]=e},s=1;s<=t;++s)if(e[s]==i&&s!=t)++a;else{if(!i&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(i),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(i);a=1,i=e[s]}return{c:n.subarray(0,r),n:t}},Ni=function(e,t){for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},Pi=function(e,t,n){var r=n.length,i=wi(t+2);e[i]=r&255,e[i+1]=r>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var a=0;a<r;++a)e[i+a+4]=n[a];return(i+4+r)*8},Fi=function(e,t,n,r,i,a,o,s,c,l,u){Oi(t,u++,n),++i[256];for(var d=Ai(i,15),f=d.t,p=d.l,m=Ai(a,15),h=m.t,g=m.l,_=Mi(f),v=_.c,y=_.n,b=Mi(h),x=b.c,ee=b.n,S=new Y(19),C=0;C<v.length;++C)++S[v[C]&31];for(var C=0;C<x.length;++C)++S[x[C]&31];for(var w=Ai(S,7),T=w.t,te=w.l,E=19;E>4&&!T[ui[E-1]];--E);var ne=l+5<<3,D=Ni(i,bi)+Ni(a,xi)+o,O=Ni(i,f)+Ni(a,h)+o+14+3*E+Ni(S,T)+2*S[16]+3*S[17]+7*S[18];if(c>=0&&ne<=D&&ne<=O)return Pi(t,u,e.subarray(c,c+l));var k,A,j,re;if(Oi(t,u,1+(O<D)),u+=2,O<D){k=yi(f,p,0),A=f,j=yi(h,g,0),re=h;var ie=yi(T,te,0);Oi(t,u,y-257),Oi(t,u+5,ee-1),Oi(t,u+10,E-4),u+=14;for(var C=0;C<E;++C)Oi(t,u+3*C,T[ui[C]]);u+=3*E;for(var M=[v,x],ae=0;ae<2;++ae)for(var N=M[ae],C=0;C<N.length;++C){var P=N[C]&31;Oi(t,u,ie[P]),u+=T[P],P>15&&(Oi(t,u,N[C]>>5&127),u+=N[C]>>12)}}else k=Si,A=bi,j=Ci,re=xi;for(var C=0;C<s;++C){var F=r[C];if(F>255){var P=F>>18&31;ki(t,u,k[P+257]),u+=A[P+257],P>7&&(Oi(t,u,F>>23&31),u+=ci[P]);var I=F&31;ki(t,u,j[I]),u+=re[I],I>3&&(ki(t,u,F>>5&8191),u+=li[I])}else ki(t,u,k[F]),u+=A[F]}return ki(t,u,k[256]),u+A[256]},Ii=new si([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Li=new J(0),Ri=function(e,t,n,r,i,a){var o=a.z||e.length,s=new J(r+o+5*(1+Math.ceil(o/7e3))+i),c=s.subarray(r,s.length-i),l=a.l,u=(a.r||0)&7;if(t){u&&(c[0]=a.r>>3);for(var d=Ii[t-1],f=d>>13,p=d&8191,m=(1<<n)-1,h=a.p||new Y(32768),g=a.h||new Y(m+1),_=Math.ceil(n/3),v=2*_,y=function(t){return(e[t]^e[t+1]<<_^e[t+2]<<v)&m},b=new si(25e3),x=new Y(288),ee=new Y(32),S=0,C=0,w=a.i||0,T=0,te=a.w||0,E=0;w+2<o;++w){var ne=y(w),D=w&32767,O=g[ne];if(h[D]=O,g[ne]=D,te<=w){var k=o-w;if((S>7e3||T>24576)&&(k>423||!l)){u=Fi(e,c,0,b,x,ee,C,T,E,w-E,u),T=S=C=0,E=w;for(var A=0;A<286;++A)x[A]=0;for(var A=0;A<30;++A)ee[A]=0}var j=2,re=0,ie=p,M=D-O&32767;if(k>2&&ne==y(w-M))for(var ae=Math.min(f,k)-1,N=Math.min(32767,w),P=Math.min(258,k);M<=N&&--ie&&D!=O;){if(e[w+j]==e[w+j-M]){for(var F=0;F<P&&e[w+F]==e[w+F-M];++F);if(F>j){if(j=F,re=M,F>ae)break;for(var I=Math.min(M,F-2),oe=0,A=0;A<I;++A){var se=w-M+A&32767,ce=se-h[se]&32767;ce>oe&&(oe=ce,O=se)}}}D=O,O=h[D],M+=D-O&32767}if(re){b[T++]=268435456|mi[j]<<18|gi[re];var le=mi[j]&31,ue=gi[re]&31;C+=ci[le]+li[ue],++x[257+le],++ee[ue],te=w+j,++S}else b[T++]=e[w],++x[e[w]]}}for(w=Math.max(w,te);w<o;++w)b[T++]=e[w],++x[e[w]];u=Fi(e,c,l,b,x,ee,C,T,E,w-E,u),l||(a.r=u&7|c[u/8|0]<<3,u-=7,a.h=g,a.p=h,a.i=w,a.w=te)}else{for(var w=a.w||0;w<o+l;w+=65535){var de=w+65535;de>=o&&(c[u/8|0]=l,de=o),u=Pi(c,u+1,e.subarray(w,de))}a.i=o}return Ti(s,0,r+wi(u)+i)},zi=(function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var n=t,r=9;--r;)n=(n&1&&-306674912)^n>>>1;e[t]=n}return e})(),Bi=function(){var e=-1;return{p:function(t){for(var n=e,r=0;r<t.length;++r)n=zi[n&255^t[r]]^n>>>8;e=n},d:function(){return~e}}},Vi=function(e,t,n,r,i){if(!i&&(i={l:1},t.dictionary)){var a=t.dictionary.subarray(-32768),o=new J(a.length+e.length);o.set(a),o.set(e,a.length),e=o,i.w=a.length}return Ri(e,t.level==null?6:t.level,t.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,n,r,i)},Hi=function(e,t){var n={};for(var r in e)n[r]=e[r];for(var r in t)n[r]=t[r];return n},Z=function(e,t,n){for(;n;++t)e[t]=n,n>>>=8};function Ui(e,t){return Vi(e,t||{},0,0)}var Wi=function(e,t,n,r){for(var i in e){var a=e[i],o=t+i,s=r;Array.isArray(a)&&(s=Hi(r,a[1]),a=a[0]),ArrayBuffer.isView(a)?n[o]=[a,s]:(n[o+=`/`]=[new J(0),s],Wi(a,o,n,r))}},Gi=typeof TextEncoder<`u`&&new TextEncoder,Ki=typeof TextDecoder<`u`&&new TextDecoder;try{Ki.decode(Li,{stream:!0})}catch{}function qi(e,t){if(t){for(var n=new J(e.length),r=0;r<e.length;++r)n[r]=e.charCodeAt(r);return n}if(Gi)return Gi.encode(e);for(var i=e.length,a=new J(e.length+(e.length>>1)),o=0,s=function(e){a[o++]=e},r=0;r<i;++r){if(o+5>a.length){var c=new J(o+8+(i-r<<1));c.set(a),a=c}var l=e.charCodeAt(r);l<128||t?s(l):l<2048?(s(192|l>>6),s(128|l&63)):l>55295&&l<57344?(l=65536+(l&1047552)|e.charCodeAt(++r)&1023,s(240|l>>18),s(128|l>>12&63),s(128|l>>6&63),s(128|l&63)):(s(224|l>>12),s(128|l>>6&63),s(128|l&63))}return Ti(a,0,o)}var Ji=function(e){var t=0;if(e)for(var n in e){var r=e[n].length;r>65535&&Di(9),t+=r+4}return t},Yi=function(e,t,n,r,i,a,o,s){var c=r.length,l=n.extra,u=s&&s.length,d=Ji(l);Z(e,t,o==null?67324752:33639248),t+=4,o!=null&&(e[t++]=20,e[t++]=n.os),e[t]=20,t+=2,e[t++]=n.flag<<1|(a<0&&8),e[t++]=i&&8,e[t++]=n.compression&255,e[t++]=n.compression>>8;var f=new Date(n.mtime==null?Date.now():n.mtime),p=f.getFullYear()-1980;if((p<0||p>119)&&Di(10),Z(e,t,p<<25|f.getMonth()+1<<21|f.getDate()<<16|f.getHours()<<11|f.getMinutes()<<5|f.getSeconds()>>1),t+=4,a!=-1&&(Z(e,t,n.crc),Z(e,t+4,a<0?-a-2:a),Z(e,t+8,n.size)),Z(e,t+12,c),Z(e,t+14,d),t+=16,o!=null&&(Z(e,t,u),Z(e,t+6,n.attrs),Z(e,t+10,o),t+=14),e.set(r,t),t+=c,d)for(var m in l){var h=l[m],g=h.length;Z(e,t,+m),Z(e,t+2,g),e.set(h,t+4),t+=4+g}return u&&(e.set(s,t),t+=u),t},Xi=function(e,t,n,r,i){Z(e,t,101010256),Z(e,t+8,n),Z(e,t+10,n),Z(e,t+12,r),Z(e,t+16,i)};function Zi(e,t){t||={};var n={},r=[];Wi(e,``,n,t);var i=0,a=0;for(var o in n){var s=n[o],c=s[0],l=s[1],u=l.level==0?0:8,d=qi(o),f=d.length,p=l.comment,m=p&&qi(p),h=m&&m.length,g=Ji(l.extra);f>65535&&Di(11);var _=u?Ui(c,l):c,v=_.length,y=Bi();y.p(c),r.push(Hi(l,{size:c.length,crc:y.d(),c:_,f:d,m,u:f!=o.length||m&&p.length!=h,o:i,compression:u})),i+=30+f+g+v,a+=76+2*(f+g)+(h||0)+v}for(var b=new J(a+22),x=i,ee=a-i,S=0;S<r.length;++S){var d=r[S];Yi(b,d.o,d,d.f,d.u,d.c.length);var C=30+d.f.length+Ji(d.extra);b.set(d.c,d.o+C),Yi(b,i,d,d.f,d.u,d.c.length,d.o,d.m),i+=16+C+(d.m?d.m.length:0)}return Xi(b,i,r.length,ee,x),b}var Qi=class{root;folders=new Map;constructor(e){this.root=e}async begin(){try{await this.root.removeEntry(`vlc`,{recursive:!0})}catch(e){if(!(e instanceof DOMException&&e.name===`NotFoundError`)){let t=e instanceof Error?`${e.name}: ${e.message}`:String(e);throw Error(`Could not clear the old vlc/ folder (${t}). Close anything using its files, such as iTunes or File Explorer, or delete the folder yourself, then generate again.`)}}this.folders.clear()}folder(e){let t=this.folders.get(e);return t===void 0&&(t=this.root.getDirectoryHandle(e,{create:!0}),this.folders.set(e,t)),t}async write(e,t){let n=e.indexOf(`/`),r=await(await(await this.folder(e.slice(0,n))).getFileHandle(e.slice(n+1),{create:!0})).createWritable();await r.write(t),await r.close()}async finish(){}},$i=class{files={};blob=null;async begin(){this.files={},this.blob=null}async write(e,t){let n=typeof t==`string`?qi(t):t;this.files[e]=[n,{level:e.endsWith(`.wav`)?0:6}]}async finish(){let e=Zi(this.files);this.blob=new Blob([e],{type:`application/zip`}),this.files={}}};function ea(e=globalThis){return`showDirectoryPicker`in e}var ta=[`playlists`,`songs`,`build`];function Q(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))n!==void 0&&n!==!1&&r.setAttribute(e,n===!0?``:n);for(let e of n)e!=null&&e!==!1&&r.append(e);return r}function na(e,...t){e.replaceChildren(...t.filter(e=>e!=null&&e!==!1))}function $(e,t=document){let n=t.getElementById(e);if(n===null)throw Error(`Missing element #${e}`);return n}function ra(e,t){let n=t.trim().toLowerCase();return n===``||[e.name,e.creators??``,...e.tags].some(e=>e.toLowerCase().includes(n))}function ia(e){if(e===void 0||e===``||e===`steam`)return null;try{let t=new URL(e);return t.protocol!==`https:`&&t.protocol!==`http:`?null:{href:t.href,label:t.hostname.replace(/^www\./,``)}}catch{return null}}function aa(e){return Q(`span`,{class:`tags`},...e.map(e=>Q(`span`,{class:`tag`},e)))}function oa(e){if(e===void 0)return null;let t=ia(e.url);return t===null?e.url?Q(`span`,{class:`muted`},e.url):null:Q(`a`,{href:t.href,target:`_blank`,rel:`noopener`},t.label)}function sa(e=document.documentElement){let t=e.getAttribute(`data-theme`)===`dark`?`light`:`dark`;e.setAttribute(`data-theme`,t);try{localStorage.setItem(`theme`,t)}catch{}return t}function ca(e,t=document){let n=new Set(e.songs.flatMap(e=>e.tags));$(`stat_songs`,t).textContent=String(e.songs.length),$(`stat_playlists`,t).textContent=String(e.playlists.length),$(`stat_tags`,t).textContent=String(n.size),$(`stat_manual`,t).textContent=String(e.playlists.filter(e=>e.manual).length)}function la(e){return[...e].sort((e,t)=>e.name.localeCompare(t.name))}function ua(e,t,n,r=document){let i=$(`playlist_list`,r),a=t.trim().toLowerCase(),o=la(e.playlists).filter(e=>e.name.toLowerCase().includes(a)).map(e=>Q(`li`,{},Q(`button`,{type:`button`,class:`playlist-item`,"data-playlist":e.name,"aria-current":e.name===n?`true`:void 0},Q(`span`,{class:`playlist-name`},e.name),Q(`span`,{class:`count`},String(e.songs.length)))));i.replaceChildren(...o.length>0?o:[Q(`li`,{class:`muted empty`},`No playlists match.`)])}function da(e,t,n=document){let r=$(`playlist_detail`,n),i=e.playlists.find(e=>e.name===t);if(i===void 0){r.replaceChildren(Q(`p`,{class:`muted empty`},`Select a playlist to see its songs.`));return}let a=new Map(e.songs.map(e=>[e.name,e])),o=new Blob([l(i)],{type:`audio/x-mpegurl`}),s=typeof URL.createObjectURL==`function`?Q(`a`,{class:`button`,href:URL.createObjectURL(o),download:`${i.name}.m3u`},`Download .m3u`):null;na(r,Q(`header`,{class:`detail-header`},Q(`div`,{},Q(`h2`,{},i.name),Q(`p`,{class:`muted`},`${i.songs.length} songs · ${i.manual?`hand-ordered`:`ordered by metadata`}`)),s),Q(`ol`,{class:`track-list`},...i.songs.map(e=>{let t=a.get(e);return Q(`li`,{},Q(`div`,{class:`track-main`},Q(`span`,{class:`track-name`},e),t?.creators?Q(`span`,{class:`muted`},t.creators):null,t===void 0?Q(`span`,{class:`tag warn`},`not in metadata`):null),Q(`div`,{class:`track-meta`},oa(t)))})))}function fa(e,t,n=document){let r=e.songs.filter(e=>ra(e,t));$(`song_count`,n).textContent=`${r.length} of ${e.songs.length}`,$(`song_rows`,n).replaceChildren(...r.map(e=>Q(`tr`,{},Q(`td`,{"data-label":`Song`},Q(`span`,{class:`track-name`},e.name),e.notes?Q(`div`,{class:`muted small`},e.notes):null),Q(`td`,{"data-label":`Creators`},e.creators??``),Q(`td`,{"data-label":`Tags`},aa(e.tags)),Q(`td`,{"data-label":`Link`},oa(e)))))}function pa(e,t,{limit:n=50,open:r=!1}={}){if(t.length===0)return null;let i=t.slice(0,n);return Q(`details`,{open:r},Q(`summary`,{},`${e} (${t.length})`),Q(`ul`,{class:`compact`},...i.map(e=>Q(`li`,{},e))),t.length>n?Q(`p`,{class:`muted`},`…and ${t.length-n} more`):null)}function ma(e,t,n=document){let r=v(e,t),i=$(`folder_check`,n);i.hidden=!1,na(i,Q(`p`,{},`Found ${e.source.size} source songs and ${e.modified.size} modified versions.`,e.ignored.length>0?` ${e.ignored.length} other files will be ignored.`:``),pa(`Songs in the metadata with no source file`,r.missingFromSource),pa(`Source files not described in the metadata`,r.notInMetadata),pa(`Modified files with no source counterpart`,r.orphanedModified))}function ha(e,t=document){let n=[...e.playlistsIncomplete].map(([e,t])=>`${e}: missing ${t.slice(0,5).join(`, `)}${t.length>5?`, …`:``}`),r=e.errors.length===0&&e.playlistsIncomplete.size===0&&e.countMismatch===null;na($(`build_result`,t),Q(`div`,{class:r?`callout success`:`callout warning`},Q(`strong`,{},r?`Done.`:`Done, with problems.`),` Converted ${e.converted.length}, copied ${e.copied.length} modified, wrote ${e.playlistsWritten.length} playlists.`),e.countMismatch?Q(`p`,{class:`error`},`File counts (pre: ${e.countMismatch.pre}, post: ${e.countMismatch.post}) do not match.`):null,pa(`Songs that failed (see logs/)`,e.errors.map(e=>`${e.song}: ${e.message}`),{open:!0}),pa(`Playlists skipped for missing songs (not written)`,n,{open:!0}))}async function ga(e){let t=[];for(let n of[`source`,`modified`]){let r;try{r=await e.getDirectoryHandle(n)}catch{continue}for await(let e of r.values())e.kind===`file`&&t.push({path:`${n}/${e.name}`,file:await e.getFile()})}return t}function _a(e,t,n){let r={layout:null,directory:null,downloadURL:null},i=ea(window),a=$(`pick_folder_btn`,t),o=$(`folder_input`,t),s=$(`generate_btn`,t),c=$(`download_link`,t),l=$(`folder_name`,t),u=$(`reuse_folder_btn`,t),d=$(`forget_folder_btn`,t),f=$(`progress`,t),p=$(`progress_bar`,t),m=$(`progress_label`,t);$(`build_mode_note`,t).textContent=i?`This browser can write vlc/ and logs/ straight into the chosen folder; it will ask for permission.`:`This browser cannot write to folders, so the output is offered as a vlc.zip download instead. Everything is held in memory until then, so for a large library use a Chromium-based browser.`;let h=(n,i)=>{r.layout=n,l.textContent=i,ma(n,e,t),s.disabled=n.source.size===0,$(`build_result`,t).replaceChildren(n.source.size===0?Q(`p`,{class:`error`},`No songs found in a 'source' folder.`):``)},g=e=>{$(`build_result`,t).replaceChildren(Q(`p`,{class:`error`},String(e)))},v=async e=>{r.directory=e;let t=await ga(e);h(_(t),e.name)},y=null,b=e=>{y=e,u.hidden=e===null,d.hidden=e===null,u.textContent=e===null?``:`Use "${e.name}" again`,a.textContent=e===null?`Choose music folder…`:`Choose another folder…`,a.className=e===null?`primary`:`secondary`};i&&ri(n).then(b),u.addEventListener(`click`,async()=>{if(y!==null)try{if(!await oi(y)){g(`Access to the folder was not allowed; choose it again or allow access when asked.`);return}await v(y)}catch(e){g(e)}}),d.addEventListener(`click`,async()=>{await ai(n),b(null)}),a.addEventListener(`click`,async()=>{if(!i){o.click();return}try{let e=window.showDirectoryPicker,t=await e({mode:`readwrite`,id:`music`});await v(t),await ii(t,n),b(t)}catch(e){if(e instanceof DOMException&&e.name===`AbortError`)return;g(e)}}),o.addEventListener(`change`,()=>{let e=[...o.files??[]].map(e=>({path:e.webkitRelativePath||e.name,file:e})),t=e[0]?.path.split(`/`)[0]??``;h(_(e),t)}),s.addEventListener(`click`,async()=>{if(r.layout===null)return;let n=r.directory===null?new $i:new Qi(r.directory);s.disabled=!0,a.disabled=!0,u.disabled=!0,c.hidden=!0,r.downloadURL!==null&&URL.revokeObjectURL(r.downloadURL),f.hidden=!1,$(`build_result`,t).replaceChildren();try{ha(await x(r.layout,e,n,{onProgress:({done:e,total:t,current:n})=>{p.max=t,p.value=e,m.textContent=`${e} / ${t}${n?` · ${n}`:``}`}}),t),n instanceof $i&&n.blob!==null&&(r.downloadURL=URL.createObjectURL(n.blob),c.href=r.downloadURL,c.hidden=!1,c.click())}catch(e){$(`build_result`,t).replaceChildren(Q(`p`,{class:`error`},String(e)))}finally{s.disabled=!1,a.disabled=!1,u.disabled=!1}})}function va(e){let[t,...n]=e.replace(/^#/,``).split(`/`),r=n.length>0?decodeURIComponent(n.join(`/`)):null;return{view:ta.includes(t)?t:`playlists`,playlist:r}}function ya(e){return e.playlist===null?`#${e.view}`:`#${e.view}/${encodeURIComponent(e.playlist)}`}function ba(e,t){for(let n of ta){$(`view_${n}`,t).hidden=n!==e;let r=$(`tab_${n}`,t);r.setAttribute(`aria-selected`,String(n===e)),r.tabIndex=n===e?0:-1}}function xa(e=document,t=Yr()){let n=``,r=la(t.playlists)[0]?.name??null,i=va(location.hash),a=()=>{ba(i.view,e);let a=i.playlist??r;ua(t,n,a,e),da(t,a,e)};ca(t,e),fa(t,``,e),a();let o=e=>{i=e,history.replaceState(null,``,ya(i)),a()};for(let t of ta)$(`tab_${t}`,e).addEventListener(`click`,()=>o({...i,view:t}));$(`playlist_list`,e).addEventListener(`click`,e=>{let t=e.target.closest(`[data-playlist]`);t!==null&&o({view:`playlists`,playlist:t.dataset.playlist??null})}),$(`playlist_filter`,e).addEventListener(`input`,e=>{n=e.target.value,a()}),$(`song_filter`,e).addEventListener(`input`,n=>{fa(t,n.target.value,e)}),window.addEventListener(`hashchange`,()=>{i=va(location.hash),a()}),$(`theme_toggle_btn`,e).addEventListener(`click`,()=>sa(e.documentElement)),$(`version_info`,e).textContent=`v1.0.0 (8e665571)`,_a(t,e)}xa();