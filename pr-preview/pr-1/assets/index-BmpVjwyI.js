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

- name: SLUMP (Japanese)
  tags: Workout
  creators: Shayne Orok

- name: SLUMP
  tags: Workout
  creators: Stray Kids

- name: Dark Aria
  tags: Workout
  creators: Akuro Soren

- name: Irregular God
  tags: Workout
  creators: Kevin Penkin

- name: Like Flames
  tags: Workout
  creators: MindaRyn

- name: Nobody
  creators: OneRepublic

- name: Reincarnate
  creators: Takuma Terashima

- name: Unlasting (English)
  creators: AirahTea

- name: Unlasting (German)
  tags: Workout
  creators: Jinja

- name: Unlasting
  creators: LiSA

- name: Takedown
  creators: Huntrix

- name: Golden
  creators: Huntrix
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

- name: Boku no Sensou (LoFi)
  tags: Anime, LoFi
  creators: kurochuu

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
`,M=`- name: SPECIALZ
  url: https://www.youtube.com/watch?v=5RaU8K8sLTM
  creators: King Gnu
`,re=`- name: Muhammed's Radio
  creators: Warren Zevon

- name: Johnny Strikes up the Band
  creators: Warren Zevon

- name: Desperados Under the Eaves
  creators: Warren Zevon

- name: My Shit's Fucked Up
  creators: Warren Zevon

- name: Roland the Headless Thompson Gunner
  creators: Warren Zevon

- name: Werewolves of London
  creators: Warren Zevon
`,N=`- Alicia
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
`,ie=`- Alicia
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
- SLUMP (Japanese)
- SLUMP
- Dark Aria
- Irregular God
- Like Flames
- Unlasting (German)
`,P=Symbol(`NOT_RESOLVED`);function F(e,t){return{tagName:e,nodeKind:`scalar`,implicit:t.implicit??!1,matchByTagPrefix:t.matchByTagPrefix??!1,implicitFirstChars:t.implicitFirstChars??null,resolve:t.resolve,identify:t.identify,represent:t.represent??(e=>String(e)),representTagName:t.representTagName??(()=>e)}}function oe(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`sequence`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addItem:t.addItem,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}function se(e,t){let n=t.finalize===void 0;return{tagName:e,nodeKind:`mapping`,implicit:!1,matchByTagPrefix:t.matchByTagPrefix??!1,create:t.create,addPair:t.addPair,has:t.has,keys:t.keys,get:t.get,finalize:t.finalize??(e=>e),carrierIsResult:n,identify:t.identify,represent:t.represent??(e=>e),representTagName:t.representTagName??(()=>e)}}var ce=F(`tag:yaml.org,2002:str`,{resolve:e=>e,identify:e=>typeof e==`string`}),le=[``,`~`,`null`,`Null`,`NULL`],ue=F(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>le.indexOf(e)===-1?P:null,identify:e=>e===null,represent:()=>`null`}),de=F(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[`n`],resolve:(e,t)=>e===`null`||t&&e===``?null:P,identify:e=>e===null,represent:()=>`null`}),fe=[``,`~`,`null`,`Null`,`NULL`],pe=F(`tag:yaml.org,2002:null`,{implicit:!0,implicitFirstChars:[``,`~`,`n`,`N`],resolve:e=>fe.indexOf(e)===-1?P:null,identify:e=>e===null,represent:()=>`null`}),me=[`true`,`True`,`TRUE`],he=[`false`,`False`,`FALSE`],ge=F(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`T`,`f`,`F`],resolve:e=>me.indexOf(e)!==-1||he.indexOf(e)===-1&&P,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),_e=[`true`],ve=[`false`],ye=F(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`t`,`f`],resolve:e=>_e.indexOf(e)!==-1||ve.indexOf(e)===-1&&P,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),be=[`true`,`True`,`TRUE`,`y`,`Y`,`yes`,`Yes`,`YES`,`on`,`On`,`ON`],xe=[`false`,`False`,`FALSE`,`n`,`N`,`no`,`No`,`NO`,`off`,`Off`,`OFF`],Se=F(`tag:yaml.org,2002:bool`,{implicit:!0,implicitFirstChars:[`y`,`Y`,`n`,`N`,`t`,`T`,`f`,`F`,`o`,`O`],resolve:e=>be.indexOf(e)!==-1||xe.indexOf(e)===-1&&P,identify:e=>Object.prototype.toString.call(e)===`[object Boolean]`,represent:e=>e?`true`:`false`}),Ce=RegExp(`^(?:0o[0-7]+|0x[0-9a-fA-F]+|[-+]?[0-9]+)$`),we=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Te(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function Ee(e,t){if(t){if(!we.test(e))return P}else if(!Ce.test(e))return P;let n=Te(e);return Number.isFinite(n)?n:P}var De=F(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:Ee,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Oe=RegExp(`^-?(?:0|[1-9][0-9]*)$`),ke=RegExp(`^(?:[-+]?0b[0-1]+|[-+]?0o[0-7]+|[-+]?0x[0-9a-fA-F]+|[-+]?[0-9]+)$`);function Ae(e){let t=e,n=1;return(t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`)?n*parseInt(t.slice(2),2):t.startsWith(`0o`)?n*parseInt(t.slice(2),8):t.startsWith(`0x`)?n*parseInt(t.slice(2),16):n*parseInt(t,10)}function je(e,t){if(t){if(!ke.test(e))return P}else if(!Oe.test(e))return P;let n=Ae(e);return Number.isFinite(n)?n:P}var Me=F(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:je,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Ne=RegExp(`^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?0x[0-9a-fA-F_]+|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+|[-+]?(?:0|[1-9][0-9_]*))$`);function Pe(e){let t=e.replace(/_/g,``),n=1;if((t[0]===`-`||t[0]===`+`)&&(t[0]===`-`&&(n=-1),t=t.slice(1)),t.startsWith(`0b`))return n*parseInt(t.slice(2),2);if(t.startsWith(`0x`))return n*parseInt(t.slice(2),16);if(t.includes(`:`)){let e=0;for(let n of t.split(`:`))e=e*60+Number(n);return n*e}return t!==`0`&&t[0]===`0`?n*parseInt(t,8):n*parseInt(t,10)}function Fe(e){if(!Ne.test(e))return P;let t=Pe(e);return Number.isFinite(t)?t:P}var Ie=F(`tag:yaml.org,2002:int`,{implicit:!0,implicitFirstChars:[`-`,`+`,...`0123456789`],resolve:Fe,identify:e=>Number.isInteger(e)&&!Object.is(e,-0)&&e.toString(10).indexOf(`e`)<0,represent:e=>e.toString(10)}),Le=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),Re=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function ze(e){if(!Le.test(e))return P;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)||Re.test(e)?r:P}function Be(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Ve=F(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:ze,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Be}),He=RegExp(`^-?(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$`),Ue=RegExp(`^(?:[-+]?[0-9]+(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?|[-+]?\\.[0-9]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function We(e,t){if(t){if(!Ue.test(e))return P;let t=e.toLowerCase(),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=n*parseFloat(t);return Number.isFinite(r)?r:P}if(!He.test(e))return P;let n=Number(e);return Number.isFinite(n)?n:P}function Ge(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Ke=F(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,...`0123456789`],resolve:We,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Ge}),qe=RegExp(`^(?:[-+]?(?:(?:[0-9][0-9_]*)?\\.[0-9_]*)(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`),Je=RegExp(`^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$`);function Ye(e){if(!qe.test(e))return P;let t=e.toLowerCase().replace(/_/g,``),n=t[0]===`-`?-1:1;if(`+-`.includes(t[0])&&(t=t.slice(1)),t===`.inf`)return n===1?1/0:-1/0;if(t===`.nan`)return NaN;let r=0;if(t.includes(`:`)){for(let e of t.split(`:`))r=r*60+Number(e);r*=n}else r=n*parseFloat(t);return Number.isFinite(r)||Je.test(e)?r:P}function Xe(e){if(isNaN(e))return`.nan`;if(e===1/0)return`.inf`;if(e===-1/0)return`-.inf`;if(Object.is(e,-0))return`-0.0`;let t=e.toString(10);return/^[-+]?[0-9]+e/.test(t)?t.replace(`e`,`.e`):t}var Ze=F(`tag:yaml.org,2002:float`,{implicit:!0,implicitFirstChars:[`-`,`+`,`.`,...`0123456789`],resolve:Ye,identify:e=>typeof e==`number`&&(!Number.isInteger(e)||Object.is(e,-0)||e.toString(10).indexOf(`e`)>=0),represent:Xe}),Qe=F(`tag:yaml.org,2002:merge`,{implicit:!0,implicitFirstChars:[`<`],resolve:(e,t)=>e===`<<`||t&&e===``?`<<`:P,identify:()=>!1}),$e=/^[A-Za-z0-9+/]*={0,2}$/;function et(e){let t=e.replace(/\s/g,``);if(t.length%4!=0||!$e.test(t))return P;let n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r}function tt(e){let t=``;for(let n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return btoa(t)}var nt=F(`tag:yaml.org,2002:binary`,{resolve:et,identify:e=>Object.prototype.toString.call(e)===`[object Uint8Array]`,represent:tt}),rt=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$`),it=RegExp(`^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$`);function at(e,t,n,r=0,i=0,a=0,o=0){let s=new Date(Date.UTC(e,t,n,r,i,a,o));return s.setUTCFullYear(e,t,n),s}function ot(e){let t=rt.exec(e);if(t===null&&(t=it.exec(e)),t===null)return P;let n=+t[1],r=t[2]-1,i=+t[3];if(!t[4]){let e=at(n,r,i);return e.getUTCFullYear()!==n||e.getUTCMonth()!==r||e.getUTCDate()!==i?P:e}let a=+t[4],o=+t[5],s=+t[6],c=0;if(a>23||o>59||s>59)return P;if(t[7]){let e=t[7].slice(0,3);for(;e.length<3;)e+=`0`;c=+e}let l=at(n,r,i,a,o,s,c);if(l.getUTCFullYear()!==n||l.getUTCMonth()!==r||l.getUTCDate()!==i)return P;if(t[9]){let e=+t[10],n=+(t[11]||0);if(e>23||n>59)return P;let r=(e*60+n)*6e4;l.setTime(l.getTime()-(t[9]===`-`?-r:r))}return l}var st=F(`tag:yaml.org,2002:timestamp`,{implicit:!0,implicitFirstChars:[...`0123456789`],resolve:ot,identify:e=>e instanceof Date,represent:e=>e.toISOString()}),ct=oe(`tag:yaml.org,2002:seq`,{create:()=>[],addItem:(e,t)=>{e.push(t)},identify:Array.isArray});function lt(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===null||t===Object.prototype}function ut(e,t){let n={};for(let r of t)e[r]!==void 0&&(n[r]=e[r]);return n}var dt=oe(`tag:yaml.org,2002:omap`,{create:()=>({list:[],seen:new Set}),addItem:(e,t)=>{let n;if(t instanceof Map){if(t.size!==1)return`cannot resolve an ordered map item`;n=t.keys().next().value}else if(lt(t)){let e=Object.keys(t);if(e.length!==1)return`cannot resolve an ordered map item`;n=e[0]}else return`cannot resolve an ordered map item`;return e.seen.has(n)?`duplicate key in ordered map`:(e.seen.add(n),e.list.push(t),``)},finalize:e=>e.list,identify:()=>!1}),ft=oe(`tag:yaml.org,2002:pairs`,{create:()=>[],addItem:(e,t)=>{if(t instanceof Map)return t.size===1?(e.push(t.entries().next().value),``):`cannot resolve a pairs item`;if(Object.prototype.toString.call(t)!==`[object Object]`)return`cannot resolve a pairs item`;let n=t,r=Object.keys(n);return r.length===1?(e.push([r[0],n[r[0]]]),``):`cannot resolve a pairs item`},identify:()=>!1}),pt=se(`tag:yaml.org,2002:map`,{create:()=>({}),identify:lt,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{if(typeof t==`object`&&t)return`object-based map does not support complex keys`;let r=String(t);return r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``},has:(e,t)=>typeof t==`object`&&t?!1:Object.prototype.hasOwnProperty.call(e,String(t)),keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}}),mt=se(`tag:yaml.org,2002:set`,{create:()=>new Set,identify:e=>e instanceof Set,represent:e=>{let t=new Map;for(let n of e)t.set(n,null);return t},addPair:(e,t,n)=>n===null?(e.add(t),``):`cannot resolve a set item`,has:(e,t)=>e.has(t),keys:e=>e.keys(),get:()=>null});function ht(){return{scalar:Object.create(null),sequence:Object.create(null),mapping:Object.create(null)}}function gt(){return{scalar:[],sequence:[],mapping:[]}}function _t(e){let t=[];for(let n of e){let e=t.length;for(let r=0;r<t.length;r++){let i=t[r];if(i.nodeKind===n.nodeKind&&i.tagName===n.tagName&&i.matchByTagPrefix===n.matchByTagPrefix){e=r;break}}t[e]=n}return t}var vt=class e{tags;implicitScalarTags;implicitScalarByFirstChar;implicitScalarAnyFirstChar;defaultScalarTag;defaultSequenceTag;defaultMappingTag;exact;prefix;constructor(e){let t=_t(e),n=[],r=ht(),i=gt();for(let e of t){if(e.nodeKind===`scalar`&&e.implicit){if(e.matchByTagPrefix)throw Error(`Implicit scalar tags cannot match by tag prefix`);n.push(e)}switch(e.nodeKind){case`scalar`:e.matchByTagPrefix?i.scalar.push(e):r.scalar[e.tagName]=e;break;case`sequence`:e.matchByTagPrefix?i.sequence.push(e):r.sequence[e.tagName]=e;break;case`mapping`:e.matchByTagPrefix?i.mapping.push(e):r.mapping[e.tagName]=e}}let a=n.filter(e=>e.implicitFirstChars===null),o=new Set;for(let e of n)if(e.implicitFirstChars!==null)for(let t of e.implicitFirstChars)o.add(t);let s=new Map;for(let e of o)s.set(e,n.filter(t=>t.implicitFirstChars===null||t.implicitFirstChars.indexOf(e)!==-1));let c=r.scalar[`tag:yaml.org,2002:str`];if(!c)throw Error(`schema does not define the default scalar tag (tag:yaml.org,2002:str)`);this.tags=t,this.implicitScalarTags=n,this.implicitScalarByFirstChar=s,this.implicitScalarAnyFirstChar=a,this.defaultScalarTag=c,this.defaultSequenceTag=r.sequence[`tag:yaml.org,2002:seq`],this.defaultMappingTag=r.mapping[`tag:yaml.org,2002:map`],this.exact=r,this.prefix=i}lookupScalarTag(e){let t=this.exact.scalar[e];if(t)return t;for(let t of this.prefix.scalar)if(e.startsWith(t.tagName))return t}lookupSequenceTag(e){let t=this.exact.sequence[e];if(t)return t;for(let t of this.prefix.sequence)if(e.startsWith(t.tagName))return t}lookupMappingTag(e){let t=this.exact.mapping[e];if(t)return t;for(let t of this.prefix.mapping)if(e.startsWith(t.tagName))return t}resolveImplicitScalarTag(e){let t=this.implicitScalarByFirstChar.get(e.charAt(0))??this.implicitScalarAnyFirstChar;for(let n of t){let t=n.resolve(e,!1,n.tagName);if(t!==P)return{value:t,tag:n}}let n=this.defaultScalarTag;return{value:n.resolve(e,!1,n.tagName),tag:n}}withTags(...t){let n=[];for(let e of t)n=n.concat(e);return new e([...this.tags,...n])}},yt=new vt([ce,ct,pt]);new vt([...yt.tags,de,ye,Me,Ke]);var bt=new vt([...yt.tags,ue,ge,De,Ve]);new vt([...yt.tags,pe,Se,Ie,Ze,st,Qe,nt,dt,ft,mt]).withTags({...Ie,resolve:(e,t,n)=>{let r=Ie.resolve(e,t,n);return r===P?De.resolve(e,t,n):r}},{...Ze,resolve:(e,t,n)=>{let r=Ze.resolve(e,t,n);return r===P?Ve.resolve(e,t,n):r}}),se(`tag:yaml.org,2002:map`,{create:()=>new Map,addPair:(e,t,n)=>(e.set(t,n),``),has:(e,t)=>e.has(t),keys:e=>e.keys(),get:(e,t)=>e.get(t),identify:e=>e instanceof Map||lt(e),represent:e=>{if(e instanceof Map)return e;let t=new Map,n=e;for(let e of Object.keys(n))t.set(e,n[e]);return t}});function xt(e){if(Array.isArray(e)){let t=Array.prototype.slice.call(e);for(let e=0;e<t.length;e++){if(Array.isArray(t[e]))return null;typeof t[e]==`object`&&Object.prototype.toString.call(t[e])===`[object Object]`&&(t[e]=`[object Object]`)}return String(t)}return typeof e==`object`&&Object.prototype.toString.call(e)===`[object Object]`?`[object Object]`:String(e)}se(`tag:yaml.org,2002:map`,{create:()=>({}),identify:lt,represent:e=>{let t=new Map;for(let n of Object.keys(e))t.set(n,e[n]);return t},addPair:(e,t,n)=>{let r=xt(t);return r===null?`nested arrays are not supported inside keys`:(r===`__proto__`?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,``)},has:(e,t)=>{let n=xt(t);return n!==null&&Object.prototype.hasOwnProperty.call(e,n)},keys:e=>Object.keys(e),get:(e,t)=>{let n=String(t);return Object.prototype.hasOwnProperty.call(e,n)?e[n]:null}});var St={maxLength:79,indent:1,linesBefore:3,linesAfter:2};function Ct(e,t,n,r,i){let a=``,o=``,s=Math.floor(i/2)-1;return r-t>s&&(a=` ... `,t=r-s+a.length),n-r>s&&(o=` ...`,n=r+s-o.length),{str:a+e.slice(t,n).replace(/\t/g,`→`)+o,pos:r-t+a.length}}function wt(e,t){return` `.repeat(Math.max(t-e.length,0))+e}function Tt(e,t){if(!e.buffer)return null;let n={...St,...t},r=/\r?\n|\r|\0/g,i=[0],a=[],o,s=-1;for(;o=r.exec(e.buffer);)a.push(o.index),i.push(o.index+o[0].length),e.position<=o.index&&s<0&&(s=i.length-2);s<0&&(s=i.length-1);let c=``,l=Math.min(e.line+n.linesAfter,a.length).toString().length,u=n.maxLength-(n.indent+l+3);for(let t=1;t<=n.linesBefore&&!(s-t<0);t++){let r=Ct(e.buffer,i[s-t],a[s-t],e.position-(i[s]-i[s-t]),u);c=`${` `.repeat(n.indent)}${wt((e.line-t+1).toString(),l)} | ${r.str}\n${c}`}let d=Ct(e.buffer,i[s],a[s],e.position,u);c+=`${` `.repeat(n.indent)}${wt((e.line+1).toString(),l)} | ${d.str}\n`,c+=`${`-`.repeat(n.indent+l+3+d.pos)}^\n`;for(let t=1;t<=n.linesAfter&&!(s+t>=a.length);t++){let r=Ct(e.buffer,i[s+t],a[s+t],e.position-(i[s]-i[s+t]),u);c+=`${` `.repeat(n.indent)}${wt((e.line+t+1).toString(),l)} | ${r.str}\n`}return c.replace(/\n$/,``)}function Et(e,t){let n=``;return e.mark?(e.mark.name&&(n+=`in "${e.mark.name}" `),n+=`(${e.mark.line+1}:${e.mark.column+1})`,!t&&e.mark.snippet&&(n+=`\n\n${e.mark.snippet}`),`${e.reason} ${n}`):e.reason}var Dt=class e extends Error{reason;mark;constructor(e,t){super(),this.name=`YAMLException`,this.reason=e,this.mark=t,this.message=Et(this,!1),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}toString(e){return`${this.name}: ${Et(this,e)}`}static throwAt(t,n,r,i=``){let a=0,o=0;for(let e=0;e<n;e++){let n=t.charCodeAt(e);n===10?(a++,o=e+1):n===13&&(a++,t.charCodeAt(e+1)===10&&e++,o=e+1)}let s={name:i,buffer:t,position:n,line:a,column:n-o};throw s.snippet=Tt(s),new e(r,s)}},I={DOCUMENT:1,SEQUENCE:2,MAPPING:3,SCALAR:4,ALIAS:5,POP:6},L={PLAIN:1,SINGLE_QUOTED:2,DOUBLE_QUOTED:3,LITERAL_BLOCK:4,FOLDED_BLOCK:5},Ot={BLOCK:1,FLOW:2},R={CLIP:1,STRIP:2,KEEP:3},kt=-1;function At(e){switch(e){case 48:return`\0`;case 97:return`\x07`;case 98:return`\b`;case 116:return`	`;case 9:return`	`;case 110:return`
`;case 118:return`\v`;case 102:return`\f`;case 114:return`\r`;case 101:return`\x1B`;case 32:return` `;case 34:return`"`;case 47:return`/`;case 92:return`\\`;case 78:return``;case 95:return`\xA0`;case 76:return`\u2028`;case 80:return`\u2029`;default:return``}}var jt=Array(256),Mt=Array(256);for(let e=0;e<256;e++)jt[e]=+!!At(e),Mt[e]=At(e);function Nt(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function Pt(e){return e>=48&&e<=57?e-48:(e|32)-97+10}function Ft(e){return e===120?2:e===117?4:8}function It(e,t,n){let r=0;for(;t<n;){let n=e.charCodeAt(t);if(n===10)r++,t++;else if(n===13)r++,t++,e.charCodeAt(t)===10&&t++;else if(n===32||n===9)t++;else break}return{position:t,breaks:r}}function Lt(e){return e===1?` `:`
`.repeat(e-1)}function Rt(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===10||t===13){r+=e.slice(a,o);let t=It(e,i,n);r+=Lt(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,o)}function zt(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===39)r+=e.slice(a,i)+`'`,i+=2,a=o=i;else if(t===10||t===13){r+=e.slice(a,o);let t=It(e,i,n);r+=Lt(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function Bt(e,t,n){let r=``,i=t,a=t,o=t;for(;i<n;){let t=e.charCodeAt(i);if(t===92){r+=e.slice(a,i),i++;let t=e.charCodeAt(i);if(t===10||t===13)i=It(e,i,n).position;else if(t<256&&jt[t])r+=Mt[t],i++;else{let n=Ft(t),a=0;for(;n>0;n--){i++;let t=Pt(e.charCodeAt(i));a=(a<<4)+t}r+=Nt(a),i++}a=o=i}else if(t===10||t===13){r+=e.slice(a,o);let t=It(e,i,n);r+=Lt(t.breaks),i=a=o=t.position}else i++,t!==32&&t!==9&&(o=i)}return r+e.slice(a,n)}function Vt(e,t,n,r,i,a){let o=r<0?0:r,s=e.slice(t,n).replace(/\r\n?/g,`
`),c=s===``?[]:(s.endsWith(`
`)?s.slice(0,-1):s).split(`
`),l=``,u=!1,d=0,f=!1;for(let e of c){let t=0;for(;t<o&&e.charCodeAt(t)===32;)t++;if(r<0||t>=e.length){d++;continue}let n=e.slice(o),i=n.charCodeAt(0);a?i===32||i===9?(f=!0,l+=`
`.repeat(u?1+d:d)):f?(f=!1,l+=`
`.repeat(d+1)):d===0?u&&(l+=` `):l+=`
`.repeat(d):l+=`
`.repeat(u?1+d:d),l+=n,u=!0,d=0}return i===R.KEEP?l+=`
`.repeat(u?1+d:d):i!==R.STRIP&&u&&(l+=`
`),l}function Ht(e,t){if(t.valueStart===kt)return``;let{valueStart:n,valueEnd:r}=t;if(t.fast)return e.slice(n,r);switch(t.style){case L.SINGLE_QUOTED:return zt(e,n,r);case L.DOUBLE_QUOTED:return Bt(e,n,r);case L.LITERAL_BLOCK:return Vt(e,n,r,t.indent,t.chomping,!1);case L.FOLDED_BLOCK:return Vt(e,n,r,t.indent,t.chomping,!0);default:return Rt(e,n,r)}}var Ut=Object.assign(Object.create(null),{"!":`!`,"!!":`tag:yaml.org,2002:`});function Wt(e,t){if(e.startsWith(`!<`)&&e.endsWith(`>`))return decodeURIComponent(e.slice(2,-1));let n=e.indexOf(`!`,1),r=n===-1?`!`:e.slice(0,n+1),i=t?.[r]??Ut[r]??r;return decodeURIComponent(i)+decodeURIComponent(e.slice(r.length))}var Gt=-1,Kt=`tag:yaml.org,2002:merge`,qt={filename:``,schema:bt,json:!1,maxTotalMergeKeys:1e4,maxAliases:-1};function Jt(e){return`tagStart`in e&&e.tagStart!==Gt?e.tagStart:`anchorStart`in e&&e.anchorStart!==Gt?e.anchorStart:`valueStart`in e&&e.valueStart!==Gt?e.valueStart:`start`in e?e.start:0}function z(e,t){Dt.throwAt(e.source,e.position,t,e.filename)}function Yt(e,t,n,r){try{return n.finalize(r)}catch(n){if(n instanceof Dt)throw n;Dt.throwAt(e.source,t,n instanceof Error?n.message:String(n),e.filename)}}function Xt(e,t){let n=Ht(e.source,t),r=t.tagStart===Gt?``:e.source.slice(t.tagStart,t.tagEnd),i=e.schema.defaultScalarTag;if(r!==``){if(r===`!`)return{value:n,tag:i};let t=Wt(r,e.tagHandlers),a=e.schema.lookupScalarTag(t);if(a){let r=a.resolve(n,!0,t);return r===P&&z(e,`cannot resolve a node with !<${t}> explicit tag`),{value:r,tag:a}}let o=e.schema.lookupMappingTag(t)??e.schema.lookupSequenceTag(t);if(o){n!==``&&z(e,`cannot resolve a node with !<${t}> explicit tag`);let r=o.create(t);return{value:o.carrierIsResult?r:Yt(e,e.position,o,r),tag:o}}z(e,`unknown scalar tag !<${t}>`)}return t.style===L.PLAIN?e.schema.resolveImplicitScalarTag(n):{value:i.resolve(n,!1,i.tagName),tag:i}}function Zt(e,t,n){let r=t.tagStart===Gt?``:e.source.slice(t.tagStart,t.tagEnd);return r===``||r===`!`?n:Wt(r,e.tagHandlers)}function Qt(e){return e.nodeKind===`mapping`}function $t(e){e.totalMergeKeys++,e.maxTotalMergeKeys!==-1&&e.totalMergeKeys>e.maxTotalMergeKeys&&z(e,`merge keys exceeded maxTotalMergeKeys (${e.maxTotalMergeKeys})`)}function en(e,t,n,r){$t(e);for(let i of r.keys(n)){if($t(e),t.tag.has(t.value,i))continue;let a=t.tag.addPair(t.value,i,r.get(n,i));a&&z(e,a),t.overridable??=new Set,t.overridable.add(i)}}function tn(e,t,n,r){if(e.position=t.keyPosition,Qt(r))en(e,t,n,r);else if(r.nodeKind===`sequence`&&Array.isArray(n)){n.length>100&&z(e,`abnormal merge sequence size`);for(let r of n){let n=e.nodeTags.get(r);n||z(e,`cannot merge mappings; the provided source object is unacceptable`),en(e,t,r,n)}}else z(e,`cannot merge mappings; the provided source object is unacceptable`)}function nn(e,t,n,r,i){if(e.position=t.keyPosition,t.keyIsMerge){tn(e,t,r,i);return}!e.json&&t.tag.has(t.value,n)&&!t.overridable?.has(n)&&z(e,`duplicated mapping key`);let a=t.tag.addPair(t.value,n,r);a&&z(e,a),t.overridable?.delete(n)}function rn(e,t,n){let r=e.frames[e.frames.length-1];if(r.kind===`document`)r.value=t,r.hasValue=!0;else if(r.kind===`sequence`){Qt(n)&&e.nodeTags.set(t,n);let i=r.tag.addItem(r.value,t,r.index++);i&&z(e,i)}else if(r.hasKey){let i=r.key;r.key=void 0,r.hasKey=!1,nn(e,r,i,t,n)}else r.key=t,r.keyPosition=e.position,r.hasKey=!0,r.keyIsMerge=n.tagName===Kt}function an(e,t,n,r,i){if(t.anchorStart!==Gt){let a={value:n,tag:r,isValueFinal:i};return e.anchors.set(e.source.slice(t.anchorStart,t.anchorEnd),a),a}return null}function on(e,t){let n={...qt,...t,events:e,documents:[],eventIndex:0,position:0,frames:[],anchors:new Map,nodeTags:new Map,tagHandlers:Object.create(null),totalMergeKeys:0,aliasCount:0};for(;n.eventIndex<n.events.length;){let e=n.events[n.eventIndex++];switch(n.position=Jt(e),e.type){case I.DOCUMENT:n.anchors=new Map,n.nodeTags=new Map,n.aliasCount=0,n.tagHandlers=Object.create(null);for(let t of e.directives)t.kind===`tag`&&(n.tagHandlers[t.handle]=t.prefix);n.frames.push({kind:`document`,position:n.position,value:void 0,hasValue:!1});break;case I.SCALAR:{let{value:t,tag:r}=Xt(n,e);an(n,e,t,r,!0),rn(n,t,r);break}case I.SEQUENCE:{let t=Zt(n,e,`tag:yaml.org,2002:seq`),r=n.schema.lookupSequenceTag(t);r||z(n,`unknown sequence tag !<${t}>`);let i=r.create(t),a=an(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`sequence`,position:n.position,value:i,tag:r,anchor:a,index:0});break}case I.MAPPING:{let t=Zt(n,e,`tag:yaml.org,2002:map`),r=n.schema.lookupMappingTag(t);r||z(n,`unknown mapping tag !<${t}>`);let i=r.create(t),a=an(n,e,i,r,r.carrierIsResult);n.frames.push({kind:`mapping`,position:n.position,value:i,tag:r,anchor:a,key:void 0,keyPosition:n.position,hasKey:!1,keyIsMerge:!1,overridable:null});break}case I.ALIAS:{n.maxAliases!==-1&&++n.aliasCount>n.maxAliases&&z(n,`aliases exceeded maxAliases (${n.maxAliases})`);let t=n.source.slice(e.anchorStart,e.anchorEnd),r=n.anchors.get(t);r||z(n,`unidentified alias "${t}"`),r.isValueFinal||z(n,`recursive alias "${t}" is not supported for tag ${r.tag.tagName} because it uses finalize()`),rn(n,r.value,r.tag);break}case I.POP:{let e=n.frames.pop();if(e.kind===`mapping`&&e.hasKey&&(n.position=e.keyPosition,z(n,`incomplete mapping pair in event stream`)),e.kind===`document`)n.documents.push(e.value);else{let t=e.tag.carrierIsResult?e.value:Yt(n,e.position,e.tag,e.value);e.anchor&&(e.anchor.value=t,e.anchor.isValueFinal=!0),rn(n,t,e.tag)}break}}}return n.documents}var B=-1,sn=Object.prototype.hasOwnProperty,cn=1,ln=2,un=3,dn=4,fn=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,pn=/[,\[\]{}]/,mn=/^(?:!|!!|![0-9A-Za-z-]+!)$/,hn=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$,_.!~*'()\[\]])`,gn=String.raw`(?:%[0-9A-Fa-f]{2}|[0-9A-Za-z\-#;/?:@&=+$.~*'()_])`,_n=RegExp(`^(?:${hn})*$`),vn=RegExp(`^(?:${gn})+$`),yn=RegExp(`^(?:!(?:${hn})*|${gn}(?:${hn})*)$`),bn={filename:``,maxDepth:100};function xn(e,t,n){e.events.push({type:I.DOCUMENT,explicitStart:t,explicitEnd:n,directives:e.directives})}function Sn(e,t,n,r,i,a,o){e.events.push({type:I.SEQUENCE,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function Cn(e,t,n,r,i,a,o){e.events.push({type:I.MAPPING,start:t,anchorStart:n,anchorEnd:r,tagStart:i,tagEnd:a,style:o})}function wn(e,t){e.events.splice(t.eventsLength,0,{type:I.MAPPING,start:t.position,anchorStart:B,anchorEnd:B,tagStart:B,tagEnd:B,style:Ot.FLOW})}function Tn(e,t,n,r,i,a,o,s,c=R.CLIP,l=-1,u=!1){e.events.push({type:I.SCALAR,valueStart:t,valueEnd:n,anchorStart:r,anchorEnd:i,tagStart:a,tagEnd:o,style:s,chomping:c,indent:l,fast:u})}function En(e,t,n){e.events.push({type:I.ALIAS,anchorStart:t,anchorEnd:n})}function Dn(e){e.events.push({type:I.POP})}function V(e){Tn(e,B,B,B,B,B,B,L.PLAIN)}function On(){return{anchorStart:B,anchorEnd:B,tagStart:B,tagEnd:B}}function kn(e){return{position:e.position,line:e.line,lineStart:e.lineStart,lineIndent:e.lineIndent,firstTabInLine:e.firstTabInLine,eventsLength:e.events.length}}function An(e,t){e.position=t.position,e.line=t.line,e.lineStart=t.lineStart,e.lineIndent=t.lineIndent,e.firstTabInLine=t.firstTabInLine,e.events.length=t.eventsLength}function H(e,t){Dt.throwAt(e.input.slice(0,e.length),e.position,t,e.filename)}function U(e){return e===10||e===13}function jn(e){return e===9||e===32}function W(e){return jn(e)||U(e)}function G(e){return e===0||W(e)}function Mn(e){return e===44||e===91||e===93||e===123||e===125}function Nn(e){return e>=48&&e<=57?e-48:-1}function Pn(e){if(e>=48&&e<=57)return e-48;let t=e|32;return t>=97&&t<=102?t-97+10:-1}function Fn(e){return e===120?2:e===117?4:e===85?8:0}function In(e){return e===48||e===97||e===98||e===116||e===9||e===110||e===118||e===102||e===114||e===101||e===32||e===34||e===47||e===92||e===78||e===95||e===76||e===80}function Ln(e){e.input.charCodeAt(e.position)===10?e.position++:(e.position++,e.input.charCodeAt(e.position)===10&&e.position++),e.line++,e.lineStart=e.position,e.lineIndent=0,e.firstTabInLine=-1}function K(e,t){let n=0,r=e.input.charCodeAt(e.position),i=e.position===e.lineStart||W(e.input.charCodeAt(e.position-1));for(;r!==0;){for(;jn(r);)i=!0,r===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),r=e.input.charCodeAt(++e.position);if(t&&i&&r===35)do r=e.input.charCodeAt(++e.position);while(!U(r)&&r!==0);if(!U(r))break;for(Ln(e),n++,i=!0,r=e.input.charCodeAt(e.position);r===32;)e.lineIndent++,r=e.input.charCodeAt(++e.position)}return n}function Rn(e,t=e.position){let n=e.input.charCodeAt(t);if((n===45||n===46)&&n===e.input.charCodeAt(t+1)&&n===e.input.charCodeAt(t+2)){let n=e.input.charCodeAt(t+3);return n===0||W(n)}return!1}function zn(e){e.position===e.lineStart&&e.input.charCodeAt(e.position)===65279&&(e.position++,e.lineStart=e.position)}function Bn(e){if(e.position!==e.lineStart)return!1;if(Rn(e))return!0;if(e.input.charCodeAt(e.position)!==65279)return!1;let t=kn(e);zn(e),K(e,!0);let n=e.input.charCodeAt(e.position),r=e.position===e.lineStart&&(n===37||n===45&&Rn(e));return An(e,t),r}function Vn(e){let t=e.input.charCodeAt(e.position);for(;t!==0&&!U(t);)t=e.input.charCodeAt(++e.position)}function Hn(e,t,n){fn.test(e.input.slice(t,n))&&H(e,`the stream contains non-printable characters`)}function Un(e,t,n){if(e.input.charCodeAt(e.position)!==33)return!1;t.tagStart!==B&&H(e,`duplication of a tag property`);let r=e.position,i=!1,a=!1,o=`!`,s=e.input.charCodeAt(++e.position);s===60?(i=!0,s=e.input.charCodeAt(++e.position)):s===33&&(a=!0,o=`!!`,s=e.input.charCodeAt(++e.position));let c=e.position,l;if(i){for(;s!==0&&s!==62;)s=e.input.charCodeAt(++e.position);s!==62&&H(e,`unexpected end of the stream within a verbatim tag`),l=e.input.slice(c,e.position),e.position++}else{for(;s!==0&&!W(s)&&!(n&&Mn(s));)s===33&&(a?H(e,`tag suffix cannot contain exclamation marks`):(o=e.input.slice(c-1,e.position+1),mn.test(o)||H(e,`named tag handle cannot contain such characters`),a=!0,c=e.position+1)),s=e.input.charCodeAt(++e.position);l=e.input.slice(c,e.position),pn.test(l)&&H(e,`tag suffix cannot contain flow indicator characters`)}return l&&!(i?_n.test(l):vn.test(l))&&H(e,`tag name cannot contain such characters: ${l}`),!i&&o!==`!`&&o!==`!!`&&!sn.call(e.tagHandlers,o)&&H(e,`undeclared tag handle "${o}"`),t.tagStart=r,t.tagEnd=e.position,!0}function Wn(e,t){if(e.input.charCodeAt(e.position)!==38)return!1;t.anchorStart!==B&&H(e,`duplication of an anchor property`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!W(e.input.charCodeAt(e.position))&&!Mn(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&H(e,`name of an anchor node must contain at least one character`),t.anchorStart=n,t.anchorEnd=e.position,!0}function Gn(e,t){if(e.input.charCodeAt(e.position)!==42)return!1;(t.anchorStart!==B||t.tagStart!==B)&&H(e,`alias node should not have any properties`),e.position++;let n=e.position;for(;e.input.charCodeAt(e.position)!==0&&!W(e.input.charCodeAt(e.position))&&!Mn(e.input.charCodeAt(e.position));)e.position++;return e.position===n&&H(e,`name of an alias node must contain at least one character`),En(e,n,e.position),!0}function Kn(e,t){K(e,!1),e.lineIndent<t&&H(e,`deficient indentation`)}function qn(e,t,n){if(e.input.charCodeAt(e.position)!==39)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===39){if(e.input.charCodeAt(e.position+1)===39){i=!1,e.position+=2;continue}let t=e.position;return e.position++,Tn(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,L.SINGLE_QUOTED,R.CLIP,-1,i),!0}U(a)?(i=!1,Kn(e,t)):e.position===e.lineStart&&Rn(e)?H(e,`unexpected end of the document within a single quoted scalar`):a!==9&&a<32?H(e,`expected valid JSON character`):e.position++}H(e,`unexpected end of the stream within a single quoted scalar`)}function Jn(e,t,n){if(e.input.charCodeAt(e.position)!==34)return!1;e.position++;let r=e.position,i=!0;for(;e.input.charCodeAt(e.position)!==0;){let a=e.input.charCodeAt(e.position);if(a===34){let t=e.position;return e.position++,Tn(e,r,t,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,L.DOUBLE_QUOTED,R.CLIP,-1,i),!0}if(a===92){i=!1;let n=e.input.charCodeAt(++e.position);if(U(n))Kn(e,t);else if(In(n))e.position++;else{let t=Fn(n);for(t===0&&H(e,`unknown escape sequence`);t-->0;)e.position++,Pn(e.input.charCodeAt(e.position))<0&&H(e,`expected hexadecimal character`);e.position++}}else U(a)?(i=!1,Kn(e,t)):e.position===e.lineStart&&Rn(e)?H(e,`unexpected end of the document within a double quoted scalar`):a!==9&&a<32?H(e,`expected valid JSON character`):e.position++}H(e,`unexpected end of the stream within a double quoted scalar`)}function Yn(e,t,n){let r=e.input.charCodeAt(e.position),i=R.CLIP,a=-1,o=!1;if(r!==124&&r!==62)return!1;let s=r===124?L.LITERAL_BLOCK:L.FOLDED_BLOCK;for(e.position++;e.input.charCodeAt(e.position)!==0;){let n=e.input.charCodeAt(e.position),r=Nn(n);if(n===43||n===45)i!==R.CLIP&&H(e,`repeat of a chomping mode identifier`),i=n===43?R.KEEP:R.STRIP,e.position++;else if(r>=0)r===0&&H(e,`bad explicit indentation width of a block scalar; it cannot be less than one`),o&&H(e,`repeat of an indentation width identifier`),a=t+r-1,o=!0,e.position++;else break}let c=!1;for(;jn(e.input.charCodeAt(e.position));)c=!0,e.position++;c&&e.input.charCodeAt(e.position)===35&&Vn(e),U(e.input.charCodeAt(e.position))?Ln(e):e.input.charCodeAt(e.position)!==0&&H(e,`a line break is expected`);let l=o?a:-1,u=0,d=e.position,f=e.position;for(;e.input.charCodeAt(e.position)!==0;){let n=e.position,r=0;for(;e.input.charCodeAt(n+r)===32;)r++;let i=e.input.charCodeAt(n+r);if(i===0){l>=0?r>l&&(f=n+r):r>0&&(f=n+r);break}if(Bn(e))break;if(!o&&l===-1&&U(i)&&(u=Math.max(u,r)),!o&&l===-1&&!U(i)&&(i===9&&r<t&&(e.position=n+r,H(e,`tab characters must not be used in indentation`)),r<u&&(e.position=n+r,H(e,`bad indentation of a mapping entry`))),l===-1&&i!==0&&!U(i)&&r<t){e.lineIndent=r,e.position=n+r;break}!o&&i!==0&&!U(i)&&l===-1&&(l=r);let a=l===-1?t+1:l;if(i!==0&&!U(i)&&r<a){e.lineIndent=r,e.position=n+r;break}Vn(e),f=e.position,U(e.input.charCodeAt(e.position))&&(Ln(e),f=e.position)}return Hn(e,d,f),Tn(e,d,f,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,s,i,l),!0}function Xn(e,t){let n=e.input.charCodeAt(e.position),r=t===cn;if(n===0||W(n)||n===35||n===38||n===42||n===33||n===124||n===62||n===39||n===34||n===37||n===64||n===96||r&&Mn(n))return!1;if(n===63||n===45){let t=e.input.charCodeAt(e.position+1);if(G(t)||r&&Mn(t))return!1}return!0}function Zn(e,t,n,r){if(!Xn(e,n))return!1;let i=e.position,a=e.position,o=e.input.charCodeAt(e.position),s=n===cn,c=!1;for(;o!==0&&!Bn(e);){if(o===58){let t=e.input.charCodeAt(e.position+1);if(G(t)||s&&Mn(t))break}else if(o===35){if(W(e.input.charCodeAt(e.position-1)))break}else if(s&&Mn(o))break;else if(U(o)){let n=e.position,r=e.line,i=e.lineStart,a=e.lineIndent;if(K(e,!1),e.lineIndent>=t){c=!0,o=e.input.charCodeAt(e.position);continue}e.position=n,e.line=r,e.lineStart=i,e.lineIndent=a;break}jn(o)||(a=e.position+1),o=e.input.charCodeAt(++e.position)}return a!==i&&(Hn(e,i,a),Tn(e,i,a,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,L.PLAIN,R.CLIP,-1,!c),!0)}function Qn(e,t){let n=e.line;K(e,!0),(e.line>n&&e.lineIndent<t||e.firstTabInLine!==-1&&e.lineIndent<t)&&H(e,`deficient indentation`)}function $n(e,t,n){let r=e.input.charCodeAt(e.position),i=r===123,a=e.position,o=!0;if(r!==91&&r!==123)return!1;let s=i?125:93;for(i?Cn(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,Ot.FLOW):Sn(e,a,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,Ot.FLOW),e.position++;e.input.charCodeAt(e.position)!==0;){Qn(e,t);let n=e.input.charCodeAt(e.position);if(n===s)return e.position++,Dn(e),!0;o?n===44&&H(e,`expected the node content, but found ','`):H(e,`missed comma between flow collection entries`);let r=!1,a=!1;n===63&&W(e.input.charCodeAt(e.position+1))&&(r=a=!0,e.position+=1,Qn(e,t));let c=e.line,l=kn(e),u=nr(e,t,cn,!1,!0);Qn(e,t),n=e.input.charCodeAt(e.position),(i||a||e.line===c)&&n===58?(r=!0,e.position++,Qn(e,t),i||wn(e,l),u||V(e),nr(e,t,cn,!1,!0)||V(e),Qn(e,t),i||Dn(e)):i&&r?(u||V(e),V(e)):i?V(e):r&&(wn(e,l),u||V(e),V(e),Dn(e)),n=e.input.charCodeAt(e.position),n===44?(o=!0,e.position++):o=!1}H(e,`unexpected end of the stream within a flow collection`)}function er(e,t,n){if(e.firstTabInLine!==-1||e.input.charCodeAt(e.position)!==45||!G(e.input.charCodeAt(e.position+1)))return!1;for(Sn(e,e.position,n.anchorStart,n.anchorEnd,n.tagStart,n.tagEnd,Ot.BLOCK);e.input.charCodeAt(e.position)===45&&G(e.input.charCodeAt(e.position+1));){e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,H(e,`tab characters must not be used in indentation`));let n=e.line;e.position++;let r=K(e,!0)>0;if(e.firstTabInLine!==-1&&e.input.charCodeAt(e.position)===45&&G(e.input.charCodeAt(e.position+1))&&H(e,`bad indentation of a sequence entry`),r&&e.lineIndent<=t?V(e):nr(e,t,un,!1,!0),K(e,!0),e.lineIndent<t||e.position>=e.length)break;e.lineIndent>t&&H(e,`bad indentation of a sequence entry`),e.line===n&&e.input.charCodeAt(e.position)===45&&G(e.input.charCodeAt(e.position+1))&&H(e,`bad indentation of a sequence entry`)}return Dn(e),!0}function tr(e,t,n,r){let i=!1,a=!1,o=!1,s=!1;if(e.firstTabInLine!==-1)return!1;let c=e.input.charCodeAt(e.position);for(;c!==0;){!i&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,H(e,`tab characters must not be used in indentation`));let l=e.input.charCodeAt(e.position+1),u=e.line;if((c===63||c===58)&&G(l))o||=(Cn(e,e.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,Ot.BLOCK),!0),c===63?(i&&V(e),a=!0,i=!0):i?i=!1:(V(e),a=!0,i=!1),e.position+=1,s=!0;else{i&&=(V(e),!1);let t=kn(e);if(!nr(e,n,ln,!1,!0))break;if(e.line===u){for(c=e.input.charCodeAt(e.position);jn(c);)c=e.input.charCodeAt(++e.position);if(c===58){if(c=e.input.charCodeAt(++e.position),G(c)||H(e,`a whitespace character is expected after the key-value separator within a block mapping`),!o){for(An(e,t),Cn(e,t.position,r.anchorStart,r.anchorEnd,r.tagStart,r.tagEnd,Ot.BLOCK),o=!0,nr(e,n,ln,!1,!0),c=e.input.charCodeAt(e.position);jn(c);)c=e.input.charCodeAt(++e.position);e.position++}a=!0,i=!1,s=!1}else if(a)H(e,`expected ':' after a mapping key`);else return r.anchorStart!==B||r.tagStart!==B?(An(e,t),!1):!0}else if(a)H(e,`can not read a block mapping entry; a multiline key may not be an implicit key`);else return r.anchorStart!==B||r.tagStart!==B?(An(e,t),!1):!0}if(nr(e,t,dn,!0,s)&&(s=!1),i||(s&&=(V(e),!1)),K(e,!0),c=e.input.charCodeAt(e.position),(e.line===u||e.lineIndent>t)&&c!==0)H(e,`bad indentation of a mapping entry`);else if(e.lineIndent<t)break}return a?(i&&V(e),o&&Dn(e),!0):!1}function nr(e,t,n,r,i,a=!0){e.depth>=e.maxDepth&&H(e,`nesting exceeded maxDepth (${e.maxDepth})`),e.depth++;let o=1,s=!1,c=!1,l=null,u=On(),d=n===dn||n===un,f=d,p=d;if(r&&K(e,!0)&&(s=!0,o=e.lineIndent>t?1:e.lineIndent===t?0:-1),o===1)for(;;){let r=e.input.charCodeAt(e.position),i=kn(e);if(s&&o!==1&&(r===33||r===38))break;if(s&&p&&(u.tagStart!==B||u.anchorStart!==B)&&(r===33||r===38)){let n=kn(e),r=t+1;if(tr(e,e.position-e.lineStart,r,u)&&e.events[n.eventsLength]?.type===I.MAPPING)return e.depth--,!0;An(e,n)}if(s&&(r===33&&u.tagStart!==B||r===38&&u.anchorStart!==B)||!Un(e,u,n===cn)&&!Wn(e,u))break;l===null&&(l=i),K(e,!0)?(s=!0,f=p,o=e.lineIndent>t?1:e.lineIndent===t?0:-1):f=!1}if(f&&=s||i,o===1||n===dn){let r=n===cn||n===ln?t:t+1,i=e.position-e.lineStart;if(o===1){if(f&&(er(e,i,u)||tr(e,i,r,u))||$n(e,r,u))c=!0;else{let t=e.input.charCodeAt(e.position);if(l!==null&&a&&p&&!f&&t!==124&&t!==62){let t=kn(e),n=l.position-l.lineStart;An(e,l),tr(e,n,r,On())&&e.events[t.eventsLength]?.type===I.MAPPING?c=!0:An(e,t)}!c&&(d&&Yn(e,r,u)||qn(e,r,u)||Jn(e,r,u)||Gn(e,u)||Zn(e,r,n,u))&&(c=!0)}}else o===0&&(c=f&&er(e,i,u))}return d&&=!c,!c&&(u.anchorStart!==B||u.tagStart!==B||d)&&(Tn(e,B,B,u.anchorStart,u.anchorEnd,u.tagStart,u.tagEnd,L.PLAIN),c=!0),e.depth--,c||u.anchorStart!==B||u.tagStart!==B}function rr(e){if(e.lineIndent>0||e.input.charCodeAt(e.position)!==37)return!1;e.position++;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!W(e.input.charCodeAt(e.position));)e.position++;let n=e.input.slice(t,e.position),r=[];for(n.length===0&&H(e,`directive name must not be less than one character in length`);e.input.charCodeAt(e.position)!==0&&!U(e.input.charCodeAt(e.position));){for(;jn(e.input.charCodeAt(e.position));)e.position++;if(e.input.charCodeAt(e.position)===35||U(e.input.charCodeAt(e.position))||e.input.charCodeAt(e.position)===0)break;let t=e.position;for(;e.input.charCodeAt(e.position)!==0&&!W(e.input.charCodeAt(e.position));)e.position++;r.push(e.input.slice(t,e.position))}if(U(e.input.charCodeAt(e.position))&&Ln(e),n===`YAML`){e.directives.some(e=>e.kind===`yaml`)&&H(e,`duplication of %YAML directive`),r.length!==1&&H(e,`YAML directive accepts exactly one argument`);let t=/^([0-9]+)\.([0-9]+)$/.exec(r[0]);t===null&&H(e,`ill-formed argument of the YAML directive`),parseInt(t[1],10)!==1&&H(e,`unacceptable YAML version of the document`),e.directives.push({kind:`yaml`,version:r[0]})}else if(n===`TAG`){r.length!==2&&H(e,`TAG directive accepts exactly two arguments`);let[t,n]=r;mn.test(t)||H(e,`ill-formed tag handle (first argument) of the TAG directive`),sn.call(e.tagHandlers,t)&&H(e,`there is a previously declared suffix for "${t}" tag handle`),yn.test(n)||H(e,`ill-formed tag prefix (second argument) of the TAG directive`),e.tagHandlers[t]=n,e.directives.push({kind:`tag`,handle:t,prefix:n})}return!0}function ir(e){e.directives=[],e.tagHandlers=Object.create(null);let t=!1;for(K(e,!0);rr(e);)t=!0,K(e,!0);let n=!1,r=!1,i=!0;if(e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45&&G(e.input.charCodeAt(e.position+3))){n=!0;let t=e.line;e.position+=3,K(e,!0),i=e.line>t}else t&&H(e,`directives end mark is expected`);let a=e.events.length;if(!n&&e.position===e.lineStart&&e.input.charCodeAt(e.position)===46&&Rn(e)){e.position+=3,K(e,!0);return}if(xn(e,n,!1),nr(e,e.lineIndent-1,dn,!1,i,i)||V(e),K(e,!0),e.position===e.lineStart&&Rn(e)&&(r=e.input.charCodeAt(e.position)===46,r)){let t=e.line;e.position+=3,K(e,!0),e.line===t&&e.position<e.length&&H(e,`end of the stream or a document separator is expected`)}let o=e.events[a];o?.type===I.DOCUMENT&&(o.explicitEnd=r),Dn(e),!r&&e.position<e.length&&!Bn(e)&&H(e,`end of the stream or a document separator is expected`)}function ar(e,t){let n=e.length,r={...bn,...t,input:`${e}\0`,length:n,position:0,line:0,lineStart:0,lineIndent:0,firstTabInLine:-1,depth:0,directives:[],tagHandlers:Object.create(null),events:[]},i=e.indexOf(`\0`);for(i!==-1&&Dt.throwAt(e,i,`null byte is not allowed in input`,r.filename);r.position<r.length&&(zn(r),K(r,!0),!(r.position>=r.length));){let e=r.position;ir(r),r.position===e&&H(r,`can not read a document`)}return r.events}var or={...bn,...qt};function sr(e,t={}){let n={...or,...t},r=String(e),i=Object.keys(bn),a=Object.keys(qt);return on(ar(r,ut(n,i)),{...ut(n,a),source:r})}function cr(e,t){let n=sr(e,t);if(n.length===0)throw new Dt(`expected a document, but the input is empty`);if(n.length===1)return n[0];throw new Dt(`expected a single document in the stream, but found more`)}function lr(e,t){return!!(e&1<<t)}var ur={applyQuoteFlowKeysOption:fr,doubleQuoteForInvisibles:pr,doubleQuoteWhitespaceOnly:mr,applyForceQuotesOption:hr,tryLongOrMultilineAsBlock:gr,quoteInvalidPlain:_r,fallbackToDoubleQuoted:vr};function dr(e){return e.presenterOptions.quoteStyle===`single`&&lr(e.allowedStylesMask,L.SINGLE_QUOTED)?L.SINGLE_QUOTED:L.DOUBLE_QUOTED}function fr(e){e.presenterOptions.quoteFlowKeys&&e.isKey&&e.flowOnly&&e.style===L.PLAIN&&(e.style=L.DOUBLE_QUOTED)}function pr(e){e.style===L.PLAIN&&/[\t\x7F-\xA0\u2028\u2029\uFEFF\uFFFE\uFFFF]/.test(e.node.value)&&(e.style=L.DOUBLE_QUOTED)}function mr(e){e.style===L.PLAIN&&/^\s+$/.test(e.node.value)&&(e.style=L.DOUBLE_QUOTED)}function hr(e){e.presenterOptions.forceQuotes&&(e.isKey||e.style!==L.PLAIN||e.node.tag===e.presenterOptions.schema.defaultScalarTag.tagName&&(e.style=e.node.value.includes(`
`)?L.DOUBLE_QUOTED:dr(e)))}function gr(e){if(e.style!==L.PLAIN||e.isKey)return;let t=e.node.value,n=t.indexOf(`
`)!==-1;if(!lr(e.allowedStylesMask,L.LITERAL_BLOCK)){n&&(e.style=L.DOUBLE_QUOTED);return}let r=e.presenterOptions.lineWidth;if(r===-1){n&&(e.style=L.LITERAL_BLOCK);return}let i=Math.max(Math.min(r,40),r-e.shiftOfContent),a=0,o=!1;for(;a<=t.length;){let e=t.length,n=t.indexOf(`
`,a);n!==-1&&(e=n);let r=t.slice(a,e);if(r.length>i&&r[0]!==` `&&/ [^ \t]/.test(r)&&(o=!0),n===-1)break;a=n+1}o?e.style=L.FOLDED_BLOCK:n&&(e.style=L.LITERAL_BLOCK)}function _r(e){e.style===L.PLAIN&&!lr(e.allowedStylesMask,L.PLAIN)&&(e.style=dr(e))}function vr(e){lr(e.allowedStylesMask,e.style)||(e.style=L.DOUBLE_QUOTED)}var yr=`[\\x09\\x0A\\x0D\\x20-\\x7E\\x85\\xA0-\\uD7FF\\uE000-\\uFFFD\\u{10000}-\\u{10FFFF}]`,br=`[\\n\\r]`,xr=`\\uFEFF`,Sr=`[ \\t]`,Cr=`(?:(?!(?:${br}|${xr}))${yr})`,wr=`(?:(?!${Sr})${Cr})`,Tr=`[\\x09\\x20-\\uD7FF\\uE000-\\uFFFF\\u{10000}-\\u{10FFFF}]`,Er=`[-?:,\\[\\]{}#&*!|>'"%@\`]`,Dr=`[,\\[\\]{}]`,Or=wr,kr=`(?:(?!${Dr})${wr})`,Ar=`(?:(?:(?!${Er})${wr})|[?:-](?=${Or}))`,jr=`(?:(?:(?!${Er})${wr})|[?:-](?=${kr}))`,Mr=`(?:(?:(?![:#])${Or})|:(?=${Or}))#*`,Nr=`(?:(?:(?![:#])${kr})|:(?=${kr}))#*`,Pr=`(?:${Sr}*${Mr})*`,Fr=`(?:${Sr}*${Nr})*`,Ir=`${Ar}#*${Pr}`,Lr=`${jr}#*${Fr}`,Rr=Ir,zr=Lr,Br=`\\n+${Mr}${Pr}`,Vr=`\\n+${Nr}${Fr}`,Hr=`${Ir}(?:${Br})*`,Ur=`${Lr}(?:${Vr})*`;RegExp(`^(?:${Hr})$`,`u`),RegExp(`^(?:${Ur})$`,`u`),RegExp(`^(?:${Rr})$`,`u`),RegExp(`^(?:${zr})$`,`u`),RegExp(`^(?:${Tr})*$`,`u`),RegExp(`^(?:${Tr}|\\n)*$`,`u`),RegExp(`^(?:${Cr}|\\n)*$`,`u`),Object.keys(ur).map(e=>Reflect.get(ur,e)),I.DOCUMENT,I.SEQUENCE,I.MAPPING,I.SCALAR,I.ALIAS,I.POP,L.PLAIN,L.SINGLE_QUOTED,L.DOUBLE_QUOTED,L.LITERAL_BLOCK,L.FOLDED_BLOCK,Ot.BLOCK,Ot.FLOW,R.CLIP,R.STRIP,R.KEEP;var Wr=Object.assign({"./data/song_metadata/Alan Wake.yaml":ee,"./data/song_metadata/Anime.yaml":S,"./data/song_metadata/Attacking Titan.yaml":C,"./data/song_metadata/Dark Souls.yaml":w,"./data/song_metadata/Disturbed.yaml":T,"./data/song_metadata/E33 (Curated).yaml":te,"./data/song_metadata/E33.yaml":E,"./data/song_metadata/Elden Ring.yaml":ne,"./data/song_metadata/Games.yaml":D,"./data/song_metadata/Last of Us.yaml":O,"./data/song_metadata/Miscellaneous.yaml":k,"./data/song_metadata/Nostalgic.yaml":A,"./data/song_metadata/Rage Against the Machine.yaml":j,"./data/song_metadata/Workout.yaml":M,"./data/song_metadata/Zevon.yaml":re}),Gr=Object.assign({"./data/manual_playlists/E33 (Curated).yaml":N,"./data/manual_playlists/E33.yaml":ie,"./data/manual_playlists/Workout.yaml":ae});function Kr(e){let t=e.slice(e.lastIndexOf(`/`)+1),n=t.lastIndexOf(`.`);return n>0?t.slice(0,n):t}function qr(e){return e.trim()===``?[]:cr(e)??[]}function Jr(e){return Object.entries(e).sort(([e],[t])=>e<t?-1:+(e>t))}function Yr(e,t){let r=[];for(let[t,i]of Jr(e))r.push(...n(Kr(t),qr(i)));let i=new Map;for(let[e,n]of Jr(t))i.set(Kr(e),qr(n).map(e=>String(e)));return{songs:r,playlists:c(r,i),manualPlaylists:i}}var Xr;function Zr(){return Xr??=Yr(Wr,Gr),Xr}var Qr=`music-app`,$r=`folders`,ei=`music`;function ti(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}function ni(){let e=indexedDB.open(Qr,1);return e.onupgradeneeded=()=>e.result.createObjectStore($r),ti(e)}async function ri(e,t){let n=await ni();try{return await ti(t(n.transaction($r,e).objectStore($r)))}finally{n.close()}}var ii={async get(){return await ri(`readonly`,e=>e.get(ei))??null},async set(e){await ri(`readwrite`,t=>t.put(e,ei))},async clear(){await ri(`readwrite`,e=>e.delete(ei))}};async function ai(e=ii){try{return await e.get()}catch{return null}}async function oi(e,t=ii){try{await t.set(e)}catch{}}async function si(e=ii){try{await e.clear()}catch{}}async function ci(e){let t=e,n={mode:`readwrite`};return t.queryPermission===void 0||await t.queryPermission(n)===`granted`||await t.requestPermission?.(n)===`granted`}var q=Uint8Array,J=Uint16Array,li=Int32Array,ui=new q([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),di=new q([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),fi=new q([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),pi=function(e,t){for(var n=new J(31),r=0;r<31;++r)n[r]=t+=1<<e[r-1];for(var i=new li(n[30]),r=1;r<30;++r)for(var a=n[r];a<n[r+1];++a)i[a]=a-n[r]<<5|r;return{b:n,r:i}},mi=pi(ui,2),hi=mi.b,gi=mi.r;hi[28]=258,gi[258]=28;var _i=pi(di,0);_i.b;for(var vi=_i.r,yi=new J(32768),Y=0;Y<32768;++Y){var bi=(Y&43690)>>1|(Y&21845)<<1;bi=(bi&52428)>>2|(bi&13107)<<2,bi=(bi&61680)>>4|(bi&3855)<<4,yi[Y]=((bi&65280)>>8|(bi&255)<<8)>>1}for(var xi=(function(e,t,n){for(var r=e.length,i=0,a=new J(t);i<r;++i)e[i]&&++a[e[i]-1];var o=new J(t);for(i=1;i<t;++i)o[i]=o[i-1]+a[i-1]<<1;var s;if(n){s=new J(1<<t);var c=15-t;for(i=0;i<r;++i)if(e[i])for(var l=i<<4|e[i],u=t-e[i],d=o[e[i]-1]++<<u,f=d|(1<<u)-1;d<=f;++d)s[yi[d]>>c]=l}else for(s=new J(r),i=0;i<r;++i)e[i]&&(s[i]=yi[o[e[i]-1]++]>>15-e[i]);return s}),Si=new q(288),Y=0;Y<144;++Y)Si[Y]=8;for(var Y=144;Y<256;++Y)Si[Y]=9;for(var Y=256;Y<280;++Y)Si[Y]=7;for(var Y=280;Y<288;++Y)Si[Y]=8;for(var Ci=new q(32),Y=0;Y<32;++Y)Ci[Y]=5;var wi=xi(Si,9,0),Ti=xi(Ci,5,0),Ei=function(e){return(e+7)/8|0},Di=function(e,t,n){return(t==null||t<0)&&(t=0),(n==null||n>e.length)&&(n=e.length),new q(e.subarray(t,n))},Oi=[`unexpected EOF`,`invalid block type`,`invalid length/literal`,`invalid distance`,`stream finished`,`no stream handler`,,`no callback`,`invalid UTF-8 data`,`extra field too long`,`date not in range 1980-2099`,`filename too long`,`stream finishing`,`invalid zip data`],ki=function(e,t,n){var r=Error(t||Oi[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,ki),!n)throw r;return r},X=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8},Ai=function(e,t,n){n<<=t&7;var r=t/8|0;e[r]|=n,e[r+1]|=n>>8,e[r+2]|=n>>16},ji=function(e,t){for(var n=[],r=0;r<e.length;++r)e[r]&&n.push({s:r,f:e[r]});var i=n.length,a=n.slice();if(!i)return{t:Ri,l:0};if(i==1){var o=new q(n[0].s+1);return o[n[0].s]=1,{t:o,l:1}}n.sort(function(e,t){return e.f-t.f}),n.push({s:-1,f:25001});var s=n[0],c=n[1],l=0,u=1,d=2;for(n[0]={s:-1,f:s.f+c.f,l:s,r:c};u!=i-1;)s=n[n[l].f<n[d].f?l++:d++],c=n[l!=u&&n[l].f<n[d].f?l++:d++],n[u++]={s:-1,f:s.f+c.f,l:s,r:c};for(var f=a[0].s,r=1;r<i;++r)a[r].s>f&&(f=a[r].s);var p=new J(f+1),m=Mi(n[u-1],p,0);if(m>t){var r=0,h=0,g=m-t,_=1<<g;for(a.sort(function(e,t){return p[t.s]-p[e.s]||e.f-t.f});r<i;++r){var v=a[r].s;if(p[v]>t)h+=_-(1<<m-p[v]),p[v]=t;else break}for(h>>=g;h>0;){var y=a[r].s;p[y]<t?h-=1<<t-p[y]++-1:++r}for(;r>=0&&h;--r){var b=a[r].s;p[b]==t&&(--p[b],++h)}m=t}return{t:new q(p),l:m}},Mi=function(e,t,n){return e.s==-1?Math.max(Mi(e.l,t,n+1),Mi(e.r,t,n+1)):t[e.s]=n},Ni=function(e){for(var t=e.length;t&&!e[--t];);for(var n=new J(++t),r=0,i=e[0],a=1,o=function(e){n[r++]=e},s=1;s<=t;++s)if(e[s]==i&&s!=t)++a;else{if(!i&&a>2){for(;a>138;a-=138)o(32754);a>2&&(o(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(o(i),--a;a>6;a-=6)o(8304);a>2&&(o(a-3<<5|8208),a=0)}for(;a--;)o(i);a=1,i=e[s]}return{c:n.subarray(0,r),n:t}},Pi=function(e,t){for(var n=0,r=0;r<t.length;++r)n+=e[r]*t[r];return n},Fi=function(e,t,n){var r=n.length,i=Ei(t+2);e[i]=r&255,e[i+1]=r>>8,e[i+2]=e[i]^255,e[i+3]=e[i+1]^255;for(var a=0;a<r;++a)e[i+a+4]=n[a];return(i+4+r)*8},Ii=function(e,t,n,r,i,a,o,s,c,l,u){X(t,u++,n),++i[256];for(var d=ji(i,15),f=d.t,p=d.l,m=ji(a,15),h=m.t,g=m.l,_=Ni(f),v=_.c,y=_.n,b=Ni(h),x=b.c,ee=b.n,S=new J(19),C=0;C<v.length;++C)++S[v[C]&31];for(var C=0;C<x.length;++C)++S[x[C]&31];for(var w=ji(S,7),T=w.t,te=w.l,E=19;E>4&&!T[fi[E-1]];--E);var ne=l+5<<3,D=Pi(i,Si)+Pi(a,Ci)+o,O=Pi(i,f)+Pi(a,h)+o+14+3*E+Pi(S,T)+2*S[16]+3*S[17]+7*S[18];if(c>=0&&ne<=D&&ne<=O)return Fi(t,u,e.subarray(c,c+l));var k,A,j,M;if(X(t,u,1+(O<D)),u+=2,O<D){k=xi(f,p,0),A=f,j=xi(h,g,0),M=h;var re=xi(T,te,0);X(t,u,y-257),X(t,u+5,ee-1),X(t,u+10,E-4),u+=14;for(var C=0;C<E;++C)X(t,u+3*C,T[fi[C]]);u+=3*E;for(var N=[v,x],ie=0;ie<2;++ie)for(var ae=N[ie],C=0;C<ae.length;++C){var P=ae[C]&31;X(t,u,re[P]),u+=T[P],P>15&&(X(t,u,ae[C]>>5&127),u+=ae[C]>>12)}}else k=wi,A=Si,j=Ti,M=Ci;for(var C=0;C<s;++C){var F=r[C];if(F>255){var P=F>>18&31;Ai(t,u,k[P+257]),u+=A[P+257],P>7&&(X(t,u,F>>23&31),u+=ui[P]);var oe=F&31;Ai(t,u,j[oe]),u+=M[oe],oe>3&&(Ai(t,u,F>>5&8191),u+=di[oe])}else Ai(t,u,k[F]),u+=A[F]}return Ai(t,u,k[256]),u+A[256]},Li=new li([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Ri=new q(0),zi=function(e,t,n,r,i,a){var o=a.z||e.length,s=new q(r+o+5*(1+Math.ceil(o/7e3))+i),c=s.subarray(r,s.length-i),l=a.l,u=(a.r||0)&7;if(t){u&&(c[0]=a.r>>3);for(var d=Li[t-1],f=d>>13,p=d&8191,m=(1<<n)-1,h=a.p||new J(32768),g=a.h||new J(m+1),_=Math.ceil(n/3),v=2*_,y=function(t){return(e[t]^e[t+1]<<_^e[t+2]<<v)&m},b=new li(25e3),x=new J(288),ee=new J(32),S=0,C=0,w=a.i||0,T=0,te=a.w||0,E=0;w+2<o;++w){var ne=y(w),D=w&32767,O=g[ne];if(h[D]=O,g[ne]=D,te<=w){var k=o-w;if((S>7e3||T>24576)&&(k>423||!l)){u=Ii(e,c,0,b,x,ee,C,T,E,w-E,u),T=S=C=0,E=w;for(var A=0;A<286;++A)x[A]=0;for(var A=0;A<30;++A)ee[A]=0}var j=2,M=0,re=p,N=D-O&32767;if(k>2&&ne==y(w-N))for(var ie=Math.min(f,k)-1,ae=Math.min(32767,w),P=Math.min(258,k);N<=ae&&--re&&D!=O;){if(e[w+j]==e[w+j-N]){for(var F=0;F<P&&e[w+F]==e[w+F-N];++F);if(F>j){if(j=F,M=N,F>ie)break;for(var oe=Math.min(N,F-2),se=0,A=0;A<oe;++A){var ce=w-N+A&32767,le=ce-h[ce]&32767;le>se&&(se=le,O=ce)}}}D=O,O=h[D],N+=D-O&32767}if(M){b[T++]=268435456|gi[j]<<18|vi[M];var ue=gi[j]&31,de=vi[M]&31;C+=ui[ue]+di[de],++x[257+ue],++ee[de],te=w+j,++S}else b[T++]=e[w],++x[e[w]]}}for(w=Math.max(w,te);w<o;++w)b[T++]=e[w],++x[e[w]];u=Ii(e,c,l,b,x,ee,C,T,E,w-E,u),l||(a.r=u&7|c[u/8|0]<<3,u-=7,a.h=g,a.p=h,a.i=w,a.w=te)}else{for(var w=a.w||0;w<o+l;w+=65535){var fe=w+65535;fe>=o&&(c[u/8|0]=l,fe=o),u=Fi(c,u+1,e.subarray(w,fe))}a.i=o}return Di(s,0,r+Ei(u)+i)},Bi=(function(){for(var e=new Int32Array(256),t=0;t<256;++t){for(var n=t,r=9;--r;)n=(n&1&&-306674912)^n>>>1;e[t]=n}return e})(),Vi=function(){var e=-1;return{p:function(t){for(var n=e,r=0;r<t.length;++r)n=Bi[n&255^t[r]]^n>>>8;e=n},d:function(){return~e}}},Hi=function(e,t,n,r,i){if(!i&&(i={l:1},t.dictionary)){var a=t.dictionary.subarray(-32768),o=new q(a.length+e.length);o.set(a),o.set(e,a.length),e=o,i.w=a.length}return zi(e,t.level==null?6:t.level,t.mem==null?i.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+t.mem,n,r,i)},Ui=function(e,t){var n={};for(var r in e)n[r]=e[r];for(var r in t)n[r]=t[r];return n},Z=function(e,t,n){for(;n;++t)e[t]=n,n>>>=8};function Wi(e,t){return Hi(e,t||{},0,0)}var Gi=function(e,t,n,r){for(var i in e){var a=e[i],o=t+i,s=r;Array.isArray(a)&&(s=Ui(r,a[1]),a=a[0]),ArrayBuffer.isView(a)?n[o]=[a,s]:(n[o+=`/`]=[new q(0),s],Gi(a,o,n,r))}},Ki=typeof TextEncoder<`u`&&new TextEncoder,qi=typeof TextDecoder<`u`&&new TextDecoder;try{qi.decode(Ri,{stream:!0})}catch{}function Ji(e,t){if(t){for(var n=new q(e.length),r=0;r<e.length;++r)n[r]=e.charCodeAt(r);return n}if(Ki)return Ki.encode(e);for(var i=e.length,a=new q(e.length+(e.length>>1)),o=0,s=function(e){a[o++]=e},r=0;r<i;++r){if(o+5>a.length){var c=new q(o+8+(i-r<<1));c.set(a),a=c}var l=e.charCodeAt(r);l<128||t?s(l):l<2048?(s(192|l>>6),s(128|l&63)):l>55295&&l<57344?(l=65536+(l&1047552)|e.charCodeAt(++r)&1023,s(240|l>>18),s(128|l>>12&63),s(128|l>>6&63),s(128|l&63)):(s(224|l>>12),s(128|l>>6&63),s(128|l&63))}return Di(a,0,o)}var Yi=function(e){var t=0;if(e)for(var n in e){var r=e[n].length;r>65535&&ki(9),t+=r+4}return t},Xi=function(e,t,n,r,i,a,o,s){var c=r.length,l=n.extra,u=s&&s.length,d=Yi(l);Z(e,t,o==null?67324752:33639248),t+=4,o!=null&&(e[t++]=20,e[t++]=n.os),e[t]=20,t+=2,e[t++]=n.flag<<1|(a<0&&8),e[t++]=i&&8,e[t++]=n.compression&255,e[t++]=n.compression>>8;var f=new Date(n.mtime==null?Date.now():n.mtime),p=f.getFullYear()-1980;if((p<0||p>119)&&ki(10),Z(e,t,p<<25|f.getMonth()+1<<21|f.getDate()<<16|f.getHours()<<11|f.getMinutes()<<5|f.getSeconds()>>1),t+=4,a!=-1&&(Z(e,t,n.crc),Z(e,t+4,a<0?-a-2:a),Z(e,t+8,n.size)),Z(e,t+12,c),Z(e,t+14,d),t+=16,o!=null&&(Z(e,t,u),Z(e,t+6,n.attrs),Z(e,t+10,o),t+=14),e.set(r,t),t+=c,d)for(var m in l){var h=l[m],g=h.length;Z(e,t,+m),Z(e,t+2,g),e.set(h,t+4),t+=4+g}return u&&(e.set(s,t),t+=u),t},Zi=function(e,t,n,r,i){Z(e,t,101010256),Z(e,t+8,n),Z(e,t+10,n),Z(e,t+12,r),Z(e,t+16,i)};function Qi(e,t){t||={};var n={},r=[];Gi(e,``,n,t);var i=0,a=0;for(var o in n){var s=n[o],c=s[0],l=s[1],u=l.level==0?0:8,d=Ji(o),f=d.length,p=l.comment,m=p&&Ji(p),h=m&&m.length,g=Yi(l.extra);f>65535&&ki(11);var _=u?Wi(c,l):c,v=_.length,y=Vi();y.p(c),r.push(Ui(l,{size:c.length,crc:y.d(),c:_,f:d,m,u:f!=o.length||m&&p.length!=h,o:i,compression:u})),i+=30+f+g+v,a+=76+2*(f+g)+(h||0)+v}for(var b=new q(a+22),x=i,ee=a-i,S=0;S<r.length;++S){var d=r[S];Xi(b,d.o,d,d.f,d.u,d.c.length);var C=30+d.f.length+Yi(d.extra);b.set(d.c,d.o+C),Xi(b,i,d,d.f,d.u,d.c.length,d.o,d.m),i+=16+C+(d.m?d.m.length:0)}return Zi(b,i,r.length,ee,x),b}var $i=class{root;folders=new Map;constructor(e){this.root=e}async begin(){try{await this.root.removeEntry(`vlc`,{recursive:!0})}catch(e){if(!(e instanceof DOMException&&e.name===`NotFoundError`)){let t=e instanceof Error?`${e.name}: ${e.message}`:String(e);throw Error(`Could not clear the old vlc/ folder (${t}). Close anything using its files, such as iTunes or File Explorer, or delete the folder yourself, then generate again.`)}}this.folders.clear()}folder(e){let t=this.folders.get(e);return t===void 0&&(t=this.root.getDirectoryHandle(e,{create:!0}),this.folders.set(e,t)),t}async write(e,t){let n=e.indexOf(`/`),r=await(await(await this.folder(e.slice(0,n))).getFileHandle(e.slice(n+1),{create:!0})).createWritable();await r.write(t),await r.close()}async finish(){}},ea=class{files={};blob=null;async begin(){this.files={},this.blob=null}async write(e,t){let n=typeof t==`string`?Ji(t):t;this.files[e]=[n,{level:e.endsWith(`.wav`)?0:6}]}async finish(){let e=Qi(this.files);this.blob=new Blob([e],{type:`application/zip`}),this.files={}}};function ta(e=globalThis){return`showDirectoryPicker`in e}var na=[`playlists`,`songs`,`build`];function Q(e,t={},...n){let r=document.createElement(e);for(let[e,n]of Object.entries(t))n!==void 0&&n!==!1&&r.setAttribute(e,n===!0?``:n);for(let e of n)e!=null&&e!==!1&&r.append(e);return r}function ra(e,...t){e.replaceChildren(...t.filter(e=>e!=null&&e!==!1))}function $(e,t=document){let n=t.getElementById(e);if(n===null)throw Error(`Missing element #${e}`);return n}function ia(e,t){let n=t.trim().toLowerCase();return n===``||[e.name,e.creators??``,...e.tags].some(e=>e.toLowerCase().includes(n))}function aa(e){if(e===void 0||e===``||e===`steam`)return null;try{let t=new URL(e);return t.protocol!==`https:`&&t.protocol!==`http:`?null:{href:t.href,label:t.hostname.replace(/^www\./,``)}}catch{return null}}function oa(e){return Q(`span`,{class:`tags`},...e.map(e=>Q(`span`,{class:`tag`},e)))}function sa(e){if(e===void 0)return null;let t=aa(e.url);return t===null?e.url?Q(`span`,{class:`muted`},e.url):null:Q(`a`,{href:t.href,target:`_blank`,rel:`noopener`},t.label)}function ca(e=document.documentElement){let t=e.getAttribute(`data-theme`)===`dark`?`light`:`dark`;e.setAttribute(`data-theme`,t);try{localStorage.setItem(`theme`,t)}catch{}return t}function la(e,t=document){let n=new Set(e.songs.flatMap(e=>e.tags));$(`stat_songs`,t).textContent=String(e.songs.length),$(`stat_playlists`,t).textContent=String(e.playlists.length),$(`stat_tags`,t).textContent=String(n.size),$(`stat_manual`,t).textContent=String(e.playlists.filter(e=>e.manual).length)}function ua(e){return[...e].sort((e,t)=>e.name.localeCompare(t.name))}function da(e,t,n,r=document){let i=$(`playlist_list`,r),a=t.trim().toLowerCase(),o=ua(e.playlists).filter(e=>e.name.toLowerCase().includes(a)).map(e=>Q(`li`,{},Q(`button`,{type:`button`,class:`playlist-item`,"data-playlist":e.name,"aria-current":e.name===n?`true`:void 0},Q(`span`,{class:`playlist-name`},e.name),Q(`span`,{class:`count`},String(e.songs.length)))));i.replaceChildren(...o.length>0?o:[Q(`li`,{class:`muted empty`},`No playlists match.`)])}function fa(e,t,n=document){let r=$(`playlist_detail`,n),i=e.playlists.find(e=>e.name===t);if(i===void 0){r.replaceChildren(Q(`p`,{class:`muted empty`},`Select a playlist to see its songs.`));return}let a=new Map(e.songs.map(e=>[e.name,e])),o=new Blob([l(i)],{type:`audio/x-mpegurl`}),s=typeof URL.createObjectURL==`function`?Q(`a`,{class:`button`,href:URL.createObjectURL(o),download:`${i.name}.m3u`},`Download .m3u`):null;ra(r,Q(`header`,{class:`detail-header`},Q(`div`,{},Q(`h2`,{},i.name),Q(`p`,{class:`muted`},`${i.songs.length} songs · ${i.manual?`hand-ordered`:`ordered by metadata`}`)),s),Q(`ol`,{class:`track-list`},...i.songs.map(e=>{let t=a.get(e);return Q(`li`,{},Q(`div`,{class:`track-main`},Q(`span`,{class:`track-name`},e),t?.creators?Q(`span`,{class:`muted`},t.creators):null,t===void 0?Q(`span`,{class:`tag warn`},`not in metadata`):null),Q(`div`,{class:`track-meta`},sa(t)))})))}function pa(e,t,n=document){let r=e.songs.filter(e=>ia(e,t));$(`song_count`,n).textContent=`${r.length} of ${e.songs.length}`,$(`song_rows`,n).replaceChildren(...r.map(e=>Q(`tr`,{},Q(`td`,{"data-label":`Song`},Q(`span`,{class:`track-name`},e.name),e.notes?Q(`div`,{class:`muted small`},e.notes):null),Q(`td`,{"data-label":`Creators`},e.creators??``),Q(`td`,{"data-label":`Tags`},oa(e.tags)),Q(`td`,{"data-label":`Link`},sa(e)))))}function ma(e,t,{limit:n=50,open:r=!1}={}){if(t.length===0)return null;let i=t.slice(0,n);return Q(`details`,{open:r},Q(`summary`,{},`${e} (${t.length})`),Q(`ul`,{class:`compact`},...i.map(e=>Q(`li`,{},e))),t.length>n?Q(`p`,{class:`muted`},`…and ${t.length-n} more`):null)}function ha(e,t,n=document){let r=v(e,t),i=$(`folder_check`,n);i.hidden=!1,ra(i,Q(`p`,{},`Found ${e.source.size} source songs and ${e.modified.size} modified versions.`,e.ignored.length>0?` ${e.ignored.length} other files will be ignored.`:``),ma(`Songs in the metadata with no source file`,r.missingFromSource),ma(`Source files not described in the metadata`,r.notInMetadata),ma(`Modified files with no source counterpart`,r.orphanedModified))}function ga(e,t=document){let n=[...e.playlistsIncomplete].map(([e,t])=>`${e}: missing ${t.slice(0,5).join(`, `)}${t.length>5?`, …`:``}`),r=e.errors.length===0&&e.playlistsIncomplete.size===0&&e.countMismatch===null;ra($(`build_result`,t),Q(`div`,{class:r?`callout success`:`callout warning`},Q(`strong`,{},r?`Done.`:`Done, with problems.`),` Converted ${e.converted.length}, copied ${e.copied.length} modified, wrote ${e.playlistsWritten.length} playlists.`),e.countMismatch?Q(`p`,{class:`error`},`File counts (pre: ${e.countMismatch.pre}, post: ${e.countMismatch.post}) do not match.`):null,ma(`Songs that failed (see logs/)`,e.errors.map(e=>`${e.song}: ${e.message}`),{open:!0}),ma(`Playlists skipped for missing songs (not written)`,n,{open:!0}))}async function _a(e){let t=[];for(let n of[`source`,`modified`]){let r;try{r=await e.getDirectoryHandle(n)}catch{continue}for await(let e of r.values())e.kind===`file`&&t.push({path:`${n}/${e.name}`,file:await e.getFile()})}return t}function va(e,t,n){let r={layout:null,directory:null,downloadURL:null},i=ta(window),a=$(`pick_folder_btn`,t),o=$(`folder_input`,t),s=$(`generate_btn`,t),c=$(`download_link`,t),l=$(`folder_name`,t),u=$(`reuse_folder_btn`,t),d=$(`forget_folder_btn`,t),f=$(`progress`,t),p=$(`progress_bar`,t),m=$(`progress_label`,t);$(`build_mode_note`,t).textContent=i?`This browser can write vlc/ and logs/ straight into the chosen folder; it will ask for permission.`:`This browser cannot write to folders, so the output is offered as a vlc.zip download instead. Everything is held in memory until then, so for a large library use a Chromium-based browser.`;let h=(n,i)=>{r.layout=n,l.textContent=i,ha(n,e,t),s.disabled=n.source.size===0,$(`build_result`,t).replaceChildren(n.source.size===0?Q(`p`,{class:`error`},`No songs found in a 'source' folder.`):``)},g=e=>{$(`build_result`,t).replaceChildren(Q(`p`,{class:`error`},String(e)))},v=async e=>{r.directory=e;let t=await _a(e);h(_(t),e.name)},y=null,b=e=>{y=e,u.hidden=e===null,d.hidden=e===null,u.textContent=e===null?``:`Use "${e.name}" again`,a.textContent=e===null?`Choose music folder…`:`Choose another folder…`,a.className=e===null?`primary`:`secondary`};i&&ai(n).then(b),u.addEventListener(`click`,async()=>{if(y!==null)try{if(!await ci(y)){g(`Access to the folder was not allowed; choose it again or allow access when asked.`);return}await v(y)}catch(e){g(e)}}),d.addEventListener(`click`,async()=>{await si(n),b(null)}),a.addEventListener(`click`,async()=>{if(!i){o.click();return}try{let e=window.showDirectoryPicker,t=await e({mode:`readwrite`,id:`music`});await v(t),await oi(t,n),b(t)}catch(e){if(e instanceof DOMException&&e.name===`AbortError`)return;g(e)}}),o.addEventListener(`change`,()=>{let e=[...o.files??[]].map(e=>({path:e.webkitRelativePath||e.name,file:e})),t=e[0]?.path.split(`/`)[0]??``;h(_(e),t)}),s.addEventListener(`click`,async()=>{if(r.layout===null)return;let n=r.directory===null?new ea:new $i(r.directory);s.disabled=!0,a.disabled=!0,u.disabled=!0,c.hidden=!0,r.downloadURL!==null&&URL.revokeObjectURL(r.downloadURL),f.hidden=!1,$(`build_result`,t).replaceChildren();try{ga(await x(r.layout,e,n,{onProgress:({done:e,total:t,current:n})=>{p.max=t,p.value=e,m.textContent=`${e} / ${t}${n?` · ${n}`:``}`}}),t),n instanceof ea&&n.blob!==null&&(r.downloadURL=URL.createObjectURL(n.blob),c.href=r.downloadURL,c.hidden=!1,c.click())}catch(e){$(`build_result`,t).replaceChildren(Q(`p`,{class:`error`},String(e)))}finally{s.disabled=!1,a.disabled=!1,u.disabled=!1}})}function ya(e){let[t,...n]=e.replace(/^#/,``).split(`/`),r=n.length>0?decodeURIComponent(n.join(`/`)):null;return{view:na.includes(t)?t:`playlists`,playlist:r}}function ba(e){return e.playlist===null?`#${e.view}`:`#${e.view}/${encodeURIComponent(e.playlist)}`}function xa(e,t){for(let n of na){$(`view_${n}`,t).hidden=n!==e;let r=$(`tab_${n}`,t);r.setAttribute(`aria-selected`,String(n===e)),r.tabIndex=n===e?0:-1}}function Sa(e=document,t=Zr()){let n=``,r=ua(t.playlists)[0]?.name??null,i=ya(location.hash),a=()=>{xa(i.view,e);let a=i.playlist??r;da(t,n,a,e),fa(t,a,e)};la(t,e),pa(t,``,e),a();let o=e=>{i=e,history.replaceState(null,``,ba(i)),a()};for(let t of na)$(`tab_${t}`,e).addEventListener(`click`,()=>o({...i,view:t}));$(`playlist_list`,e).addEventListener(`click`,e=>{let t=e.target.closest(`[data-playlist]`);t!==null&&o({view:`playlists`,playlist:t.dataset.playlist??null})}),$(`playlist_filter`,e).addEventListener(`input`,e=>{n=e.target.value,a()}),$(`song_filter`,e).addEventListener(`input`,n=>{pa(t,n.target.value,e)}),window.addEventListener(`hashchange`,()=>{i=ya(location.hash),a()}),$(`theme_toggle_btn`,e).addEventListener(`click`,()=>ca(e.documentElement)),$(`version_info`,e).textContent=`v1.0.0 (39d09c48)`,va(t,e)}Sa();