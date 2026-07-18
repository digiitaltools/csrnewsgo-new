(async () => {
    const forceRemoveLang = () => {
        document.documentElement.removeAttribute('lang');
        if (document.body) document.body.removeAttribute('lang');
    };
    forceRemoveLang();
    document.addEventListener("DOMContentLoaded", forceRemoveLang);
	
    const CONFIG = {
		API_URL: "https://newsgo.space",
		API_KEY: "berbahagia", 
		DOMAIN: window.location.origin,
		DATABASE_NAME: "consumer_electronics",
		SITE_NAME: "Diagram",
		DEFAULT_TITLE: "Wiring",
		DEFAULT_DESCRIPTION: "Wiring, Diagram, Schematic",
		DEFAULT_KEYWORDS: "",
		DEFAULT_IMAGE: "https://cdn.jsdelivr.net/gh/luqmanthinkpad/csrnew/img/n1_ipotnews.png"
	};

    const memoryCache = new Map();
    const pathName = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');

    const pathParts = pathName.split('/').filter(Boolean);
    let detailSlug = urlParams.get('detail');
    let paramType = "news"; 

    if (!detailSlug && pathParts.length > 0) {
        if (pathParts.length >= 2) {
            paramType = pathParts[0];
            detailSlug = pathParts[1];
        } else {
            detailSlug = pathParts[0];
        }
    }

    let isTldMode = (pathName !== '/' && !urlParams.has('detail'));

	const formatUTCDate = (d) => {
        if (!d) return "";
        const dateObj = (!isNaN(d) && d.toString().length <= 10) ? new Date(d * 1000) : new Date(d);
        return dateObj.toISOString();
    };

    const formatSimpleDate = (d) => {
        if (!d) return "";
        const dateObj = (!isNaN(d) && d.toString().length <= 10) ? new Date(d * 1000) : new Date(d);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const toTitleCase = (s) => s ? s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase()) : "";
    const getLink = (slug, prefix = "news") => isTldMode ? `/${prefix}/${slug}` : `/?detail=${slug}`;

	const getTemplateStyle = () => `
        <style>
            :root {
                --main-color: #000000;
                --accent: #FF0000;
                --link: #0166FF;
                --contrast: #333333;
                --light-gray: #e5e7eb;
            }
            body { font-family: Inter, -apple-system, system-ui, sans-serif; line-height: 1.6; margin: 0; background-color: #ffffff; color: var(--contrast); }
            a { color: var(--link); text-decoration: none; }
            a:hover { color: var(--accent); }
            .grid-container { max-width: 1024px; margin-left: auto; margin-right: auto; padding: 0 20px; }
            .site-header { padding: 20px 0; border-bottom: 1px solid var(--light-gray); margin-bottom: 30px; }
            .site-branding .main-title a { font-size: 24px; font-weight: bold; color: var(--main-color); }
            .site-content { display: flex; flex-direction: column; }
            .content-area { width: 100%; }
            .gb-text-ebc5ba5e { font-size: 35px; font-weight: 700; margin-bottom: 20px; line-height: 1.2em; }
            .gb-media-429ca33a { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px; }
            .dynamic-entry-content p { margin-bottom: 1.5em; font-size: 17px; }
            .dynamic-entry-content h2, .dynamic-entry-content h3 { margin-top: 1.5em; margin-bottom: 0.75em; font-weight: bold; }
            .skeleton { background: #f2f4f5; position: relative; overflow: hidden; border-radius: 4px; }
            .skeleton::after {content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: shimmer 1.5s infinite;}
            @keyframes shimmer { 100% { transform: translateX(100%); } }
            @media (min-width: 769px) {
                .is-right-sidebar { width: 30%; }
                .content-area { width: 70%; padding-right: 40px; box-sizing: border-box; }
                .site-content { flex-direction: row; }
            }
        </style>
    `;

    const wrapInLayout = (innerContent) => `
        ${getTemplateStyle()}
        <header class="site-header">
            <div class="inside-header grid-container">
                <div class="site-branding">
                    <div class="main-title"><a href="/" rel="home">${CONFIG.SITE_NAME}</a></div>
                </div>
            </div>
        </header>

        <div class="site grid-container container hfeed" id="page">
            <div class="site-content" id="content">
                <div class="content-area" id="primary">
                    <main class="site-main" id="main">
                        ${innerContent}
                    </main>
                </div>
            </div>
        </div>

        <footer style="margin-top: 50px; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 14px; color: #777;">
            <p>&copy; ${new Date().getFullYear()} ${CONFIG.SITE_NAME}. All rights reserved.</p>
        </footer>

        <!-- Popup & Sticky Ads Container -->
        <div id="popup-ads-container" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999999; align-items: center; justify-content: center;">
            <div style="position: relative; background: #fff; padding: 20px; border-radius: 8px;">
                <button onclick="document.getElementById('popup-ads-container').style.display='none'" style="position: absolute; top: -10px; right: -10px; background: red; color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">X</button>
                <div id="ads-placeholder" style="width: 300px; height: 250px;"></div>
            </div>
        </div>
        
        <div id="sticky-bottom-ad" style="position: fixed; bottom: 0; left: 0; width: 100%; z-index: 99999; display: flex; justify-content: center; background: rgba(0,0,0,0.2);">
            <div style="position: relative; background: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.1);">
                <button onclick="document.getElementById('sticky-bottom-ad').style.display='none'" style="position: absolute; top: -22px; right: 0; background: #ff4d4f; color: white; border: none; width: 22px; height: 22px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 4px 4px 0 0;">&times;</button>
                <div id="ads-sticky" style="width: 320px; height: 50px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #999;"></div>
            </div>
        </div>
    `;

	const injectSchema = (data) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    };

	const stripHtml = (value) => String(value || "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
    const limitText = (value, max = 160) => {
        const clean = stripHtml(value);
        if (clean.length <= max) return clean;
        return clean.substring(0, max).replace(/\s+\S*$/, "") + "...";
    };

    const makeAbsoluteUrl = (url) => {
        if (!url) return "";
        try { return new URL(url, CONFIG.DOMAIN).href; } catch (e) { return url; }
    };

    const getFirstImageUrl = (images) => {
        if (!images) return "";
        let list = images;
        if (typeof list === 'string') {
            try { list = JSON.parse(list); } catch (e) { return makeAbsoluteUrl(list); }
        }
        if (!Array.isArray(list)) list = [list];
        const first = list.find(Boolean);
        if (!first) return "";
        return makeAbsoluteUrl(typeof first === 'object' ? (first.url || first.src || first.image || first.thumbnail || "") : first);
    };

    const makeKeywordString = (values) => {
        const output = [];
        const add = (value) => {
            if (!value) return;
            if (Array.isArray(value)) return value.forEach(add);
            if (typeof value === 'object') return Object.values(value).forEach(add);
            String(value).split(',').forEach(item => {
                const clean = stripHtml(item).toLowerCase();
                if (clean && !output.includes(clean)) output.push(clean);
            });
        };
        values.forEach(add);
        return output.slice(0, 25).join(', ');
    };

    const findMetaTag = (attrName, attrValue) => Array.from(document.getElementsByTagName('meta')).find(meta => meta.getAttribute(attrName) === attrValue);
    const setMetaTag = (attrName, attrValue, content) => {
        if (!document.head || !content) return;
        let meta = findMetaTag(attrName, attrValue);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attrName, attrValue);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    };

    const setCanonical = (url) => {
        if (!document.head || !url) return;
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = makeAbsoluteUrl(url);
    };

    const applySeoMeta = ({ title, description, keywords, image, url, type = 'website', createdAt }) => {
        const finalTitle = limitText(title || CONFIG.DEFAULT_TITLE, 65);
        const finalDescription = limitText(description || CONFIG.DEFAULT_DESCRIPTION, 160);
        const finalKeywords = keywords || CONFIG.DEFAULT_KEYWORDS;
        const finalImage = makeAbsoluteUrl(image || CONFIG.DEFAULT_IMAGE);
        const finalUrl = makeAbsoluteUrl(url || `${CONFIG.DOMAIN}/`);

        document.title = finalTitle;
        setMetaTag('name', 'title', finalTitle);
        setMetaTag('name', 'description', finalDescription);
        setMetaTag('name', 'keywords', finalKeywords);
        setMetaTag('name', 'robots', 'index, follow');
        setMetaTag('name', 'googlebot', 'index, follow');
        setMetaTag('name', 'language', 'en-US');
        setMetaTag('property', 'og:locale', 'en-US');
        setMetaTag('property', 'og:type', type);
        setMetaTag('property', 'og:title', finalTitle);
        setMetaTag('property', 'og:description', finalDescription);
        setMetaTag('property', 'og:url', finalUrl);
        setMetaTag('property', 'og:image', finalImage);
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', finalTitle);
        setMetaTag('name', 'twitter:description', finalDescription);
        setMetaTag('name', 'twitter:image', finalImage);
    
		if (type === 'article' && createdAt) { 
			setMetaTag('property', 'article:published_time', createdAt);
			setMetaTag('property', 'article:modified_time', createdAt);
		}
		setCanonical(finalUrl);
    };
	
    const fetchAPI = async (endpoint) => {
        if (memoryCache.has(endpoint)) return memoryCache.get(endpoint); 
        
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
                headers: { 
                    'x-api-key': CONFIG.API_KEY, 
                    'original-domain': CONFIG.DOMAIN,
                    'target-db': CONFIG.DATABASE_NAME
                }
            });

            if (response.status === 429) {
                const errorData = await response.json();
                renderRateLimitMessage(errorData.error);
                return null;
            }

            if (response.status === 404) {
                return { status: "not_found" };
            }

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();

            if (data.status === "success") {
                memoryCache.set(endpoint, data);
            }

            return data;
        } catch (e) { 
            console.error("Fetch Error:", e);
            return null; 
        }
    };

    const renderRateLimitMessage = (msg) => {
        document.body.innerHTML = `
            <div style="font-family:sans-serif; text-align:center; padding:50px;">
                <h2 style="color:#ed5466;">Akses Dibatasi</h2>
                <p style="color:#666;">${msg || "Anda telah mencapai batas akses."}</p>
                <button onclick="window.location.reload()" style="padding:10px 20px; cursor:pointer;">Coba Muat Ulang</button>
            </div>`;
    };

    const renderSkeletonHome = () => { 
		if (!document.body) return;
		let items = "";
		for (let i = 0; i < 8; i++) items += `<div style="margin-bottom:20px;"><div class="skeleton" style="height:24px; width:80%; margin-bottom:8px;"></div><div class="skeleton" style="height:12px; width:150px;"></div></div>`;
		
		document.body.innerHTML = wrapInLayout(`<div>${items}</div>`);
	};
	
    const renderSkeletonDetail = () => {
		const skeletonBody = `
            <div class="skeleton" style="height:35px; width:90%; margin-bottom: 20px;"></div>
            <div class="skeleton" style="height:400px; width:100%; border-radius: 8px; margin-bottom: 20px;"></div>
            <div class="skeleton" style="height:16px; width:100%; margin-bottom: 10px;"></div>
            <div class="skeleton" style="height:16px; width:100%; margin-bottom: 10px;"></div>
            <div class="skeleton" style="height:16px; width:80%; margin-bottom: 10px;"></div>`;
        document.body.innerHTML = wrapInLayout(skeletonBody);
	};
	
    const renderNoConnection = async () => { 
		if (!document.body) {
            setTimeout(renderNoConnection, 50);
            return;
        }
        document.body.innerHTML = `<div style="text-align: center; padding: 40px; margin-top: 10vh;"><h2>SERVER DISCONNECTED</h2><button onclick="window.location.reload()">Coba Muat Ulang</button></div>`;
	};

	const renderNotFound = () => {
        document.body.innerHTML = `<div style="text-align: center; padding: 40px; margin-top: 10vh;"><h2>404 Halaman Tidak Ditemukan</h2><a href="/">Kembali ke Beranda</a></div>`;
        document.title = "404 Not Found - " + CONFIG.SITE_NAME;
    };
	
    const loadHome = async () => {
        const res = await fetchAPI('/api/news');
        if (!res) return renderNoConnection();

        const homeKeywords = makeKeywordString([CONFIG.DEFAULT_KEYWORDS, ...(res.data || []).slice(0, 15).map(item => item.keyword || item.title || item.slug)]);

        applySeoMeta({
			title: CONFIG.SITE_NAME,
			description: CONFIG.DEFAULT_DESCRIPTION,
			keywords: homeKeywords,
			image: CONFIG.DEFAULT_IMAGE,
			url: `${CONFIG.DOMAIN}/`,
			type: 'website' 
		});

		const listHtml = res.data.map(news => `
            <article class="post type-post status-publish format-standard hentry" style="margin-bottom: 30px; border-bottom: 1px solid #eaeaea; padding-bottom: 20px;">
                <h2 style="font-size: 24px; margin-bottom: 10px; line-height: 1.3;">
                    <a href="${getLink(news.slug, 'askme')}">${toTitleCase(news.keyword)}</a>
                </h2>
                <div style="font-size: 13px; color: #888;">Published on ${formatSimpleDate(news.created_at)}</div>
            </article>
        `).join('');
		
        const homeLayout = `
            <div id="top-home-ads" style="margin-bottom: 30px; text-align: center;">
                <div id="ads-728x90" style="display: none; width:728px; height:90px; margin: 0 auto;"></div>
            </div>
            <div class="home-post-list">
                ${listHtml}
            </div>
        `;

        document.body.innerHTML = wrapInLayout(homeLayout);
    };
	
    const loadDetail = async (slug, type = "news") => {
		const detailEndpoint = `/api/news/${type}/${slug}`;
		if (!memoryCache.has(detailEndpoint)) renderSkeletonDetail();
		
		const [resDetail, resRelated] = await Promise.all([
			fetchAPI(detailEndpoint),
			fetchAPI('/api/news/related').catch(() => null)
		]);
		
		if (resDetail && resDetail.status === "not_found") return renderNotFound();
		if (!resDetail || resDetail.status !== "success") return renderNoConnection();

		const news = resDetail.data;
		const pubDateUTC = formatUTCDate(news.created_at || news.updated_at);
        const pubDateSimple = formatSimpleDate(news.created_at || news.updated_at);
		const cleanTitle = toTitleCase(news.keyword || news.title);

		let contentData = news.json_sentences || news.content || []; 
		let imagesData = news.json_images || news.images || [];

		if (typeof contentData === 'string') { try { contentData = JSON.parse(contentData); } catch(e) { contentData = [contentData]; } }
		if (typeof imagesData === 'string') { try { imagesData = JSON.parse(imagesData); } catch(e) { imagesData = []; } }

		const detailDescription = limitText(news.meta_desc || (Array.isArray(contentData) ? contentData.join(' ') : contentData) || cleanTitle, 160);
		const detailKeywords = makeKeywordString([news.meta_keyword, news.keyword, news.title, slug, CONFIG.DEFAULT_KEYWORDS]);
		const detailImage = getFirstImageUrl(imagesData) || CONFIG.DEFAULT_IMAGE;
		const detailUrl = `${CONFIG.DOMAIN}${getLink(slug, type)}`;

		const schemaGraph = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "WebPage",
                    "@id": `${detailUrl}#webpage`,
                    "url": detailUrl,
                    "name": cleanTitle,
                    "datePublished": pubDateUTC,
                    "dateModified": pubDateUTC,
                    "primaryImageOfPage": { "@id": detailImage },
                    "inLanguage": "en_US"
                },
                {
                    "@type": "BlogPosting",
                    "headline": cleanTitle,
                    "keywords": detailKeywords,
                    "datePublished": pubDateUTC,
                    "dateModified": pubDateUTC,
                    "articleSection": type,
                    "description": detailDescription,
                    "image": { "@id": detailImage },
                    "inLanguage": "en_US",
                    "mainEntityOfPage": { "@id": `${detailUrl}#webpage` }
                }
            ]
        };

		injectSchema(schemaGraph);

        applySeoMeta({
            title: `${cleanTitle} - ${CONFIG.SITE_NAME}`,
            description: detailDescription,
            keywords: detailKeywords,
            image: detailImage,
            url: detailUrl,
            type: 'article',
            createdAt: pubDateUTC
        });

		const bodyHtml = contentData.map((text, i) => {
			const imgUrl = (imagesData && imagesData[i]) ? (imagesData[i].url || imagesData[i]) : "";
			const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${cleanTitle}" class="gb-media-429ca33a" loading="lazy">` : "";
			return `<p>${text}</p>${imgTag}`;
		}).join('');
		
        const relatedHtml = (resRelated && resRelated.data)
            ? resRelated.data.slice(0, 5).map(item => `
                <li style="margin-bottom: 10px;">
                    <a href="${getLink(item.slug, 'askme')}">${toTitleCase(item.keyword)}</a>
                </li>`).join('')
            : '';

        // Struktur Single HTML sesuai Template yang diberikan
        const detailHtml = `
            <article id="post-${slug}" class="dynamic-content-template post type-post status-publish format-standard has-post-thumbnail hentry">
                
                <div class="gb-element-eda36b93" style="text-align:center; margin-bottom: 25px;">
                    <div id="ads-320x50" style="display:inline-block;"></div>
                </div>

                <div class="gb-element-e3bba66d font">
                    <h1 class="gb-text gb-text-ebc5ba5e">${cleanTitle}</h1>
                </div>

                <div style="margin-bottom: 25px; color: #777; font-size: 14px;">
                    <span>Published on ${pubDateSimple}</span>
                </div>

                <div class="gb-element-fdac9640">
                    <figure>
                        <img loading="lazy" decoding="async" width="1200" height="720" alt="${cleanTitle}" class="gb-media-429ca33a" src="${detailImage}">
                    </figure>
                </div>

                <div class="gb-element-068ee5f6">
                    <div class="gb-element-4814d542">
                        <div class="dynamic-entry-content">
                            ${bodyHtml}
                        </div>
                    </div>
                </div>
                
                ${relatedHtml ? `
                <div style="margin-top: 50px; padding-top: 25px; border-top: 2px solid #f1f1f1;">
                    <h3 style="font-size: 22px; margin-bottom: 15px;">Related Posts</h3>
                    <ul style="list-style: none; padding: 0;">${relatedHtml}</ul>
                </div>` : ''}

            </article>
        `;

        document.body.innerHTML = wrapInLayout(detailHtml);
    };

    const renderRawXml = async (type) => {
		try {
            const urlFormat = isTldMode ? 'tld' : 'blogspot';
            const currentPage = pageParam || 1;
			const targetUrl = `${CONFIG.API_URL}/api/${type}?key=${CONFIG.API_KEY}&domain=${encodeURIComponent(CONFIG.DOMAIN)}&db=${CONFIG.DATABASE_NAME}&format=${urlFormat}&page=${currentPage}`;
			const res = await fetch(targetUrl, { method: 'GET', headers: { 'x-api-key': CONFIG.API_KEY, 'Accept': 'application/xml' } });
			if (!res.ok) throw new Error(`Server merespon dengan status: ${res.status}`);
			const xmlText = await res.text();
			document.open("text/xml", "replace");
			document.write(xmlText);
			document.close();
		} catch (e) {
			document.body.innerHTML = `<div style="text-align:center;"><h2>XML Render Error</h2></div>`;
		}
	};
    
    const lowerPath = pathName.toLowerCase();
	if (pageParam === 'sitemap' || lowerPath.endsWith('sitemap.xml') || lowerPath.endsWith('atom.xml')) {
		await renderRawXml('sitemap'); 
	} 
	else if (pageParam === 'rss' || lowerPath.endsWith('rss.xml')) {
		await renderRawXml('rss');
	} 
	else if (detailSlug) {
		await loadDetail(detailSlug, paramType);
		if (typeof fillDetailAds === "function") fillDetailAds();
        if (typeof fillStickyAds === "function") fillStickyAds(); 
		if (typeof showMyAds === "function") showMyAds();
	} 
	else {
		await loadHome();
		if (typeof fillHomeAds === "function") {
			const topAds = document.getElementById('ads-728x90');
			if (topAds) { topAds.style.display = 'block'; fillHomeAds(); }
		}
        if (typeof fillStickyAds === "function") fillStickyAds(); 
		if (typeof showMyAds === "function") showMyAds();
	}
})();
