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

	const getSkeletonStyle = () => `
        <style>
            .skeleton { background: #f2f4f5;position: relative; overflow: hidden; border-radius: 2px; }
            .skeleton::after {content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);animation: shimmer 1.5s infinite;}
            @keyframes shimmer { 100% { transform: translateX(100%); } }
            .sk-item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .sk-title { height: 18px; width: 85%; margin-top: 5px; margin-bottom: 5px; }
            .sk-text { height: 10px; width: 30%; }
            .sk-h1 { height: 32px; width: 90%; margin-bottom: 10px; }
            .sk-img { height: 350px; width: 100%; margin: 10px 0 20px 0; border-radius: 8px; }
            .sk-body { height: 14px; width: 100%; margin-bottom: 12px; }
        </style>
    `;

    const wrapInLayout = (innerContent, sidebarContent = '') => `
        <div class="site grid-container container hfeed" id="page">
            <header class="site-header" style="padding:20px; border-bottom: 1px solid #eee; margin-bottom: 25px;">
                <div class="inside-header" style="text-align: center;">
                    <h1 class="main-title" style="margin:0; font-size: 28px; font-weight: 700;"><a href="/" style="color: #333; text-decoration: none;">${CONFIG.SITE_NAME}</a></h1>
                    <div id="top-home-ads" style="display: block; text-align: center; margin: 20px 0px;">
                        <div id="ads-728x90" style="display: none; width:728px; height:90px; margin: 0 auto; background:#f9f9f9;"></div>
                    </div>
                </div>
            </header>
            
            <div class="site-content" id="content" style="display: flex; flex-wrap: wrap; gap: 4%;">
                <div class="content-area" id="primary" style="flex: 1 1 65%; max-width: 65%;">
                    <main class="site-main" id="main">
                        ${innerContent}
                    </main>
                </div>
                
                <aside class="widget-area sidebar is-right-sidebar" id="right-sidebar" style="flex: 1 1 30%; max-width: 30%;">
                    <div class="inside-right-sidebar">
                        <div id="ads-320x50" style="width:320px; height:50px; margin-bottom:30px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; color:#999; border-radius:8px; margin-left:auto; margin-right:auto;"></div>
                        ${sidebarContent}
                    </div>
                </aside>
            </div>
            
            <footer class="site-info" style="margin-top: 40px; padding: 20px 0; border-top: 1px solid #eee; text-align: center; font-size: 14px; color: #666;">
                <div class="inside-site-info">
                    &copy; ${new Date().getFullYear()} ${CONFIG.SITE_NAME}. All rights reserved.
                </div>
            </footer>
        </div>
        
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
        <style>
            @media (max-width: 768px) {
                #content { flex-direction: column; }
                #primary, #right-sidebar { flex: 1 1 100% !important; max-width: 100% !important; }
            }
        </style>
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
		for (let i = 0; i < 8; i++) items += `<div class="sk-item"><div class="skeleton sk-text"></div><div class="skeleton sk-title"></div></div>`;
		
		const html = getSkeletonStyle() + wrapInLayout(`<div>${items}</div>`);
		document.body.innerHTML = html;
	};
	
    const renderSkeletonDetail = () => {
		const skeletonBody = `<div><div class="skeleton sk-h1"></div><div class="skeleton sk-text" style="margin-bottom:20px;"></div><hr><div class="skeleton sk-img"></div><div class="skeleton sk-body"></div><div class="skeleton sk-body"></div></div>`;
        const sidebar = `<div class="skeleton" style="height:250px; width:100%; margin-bottom:30px;"></div><div class="skeleton sk-title" style="width:50%; height:25px;"></div><div class="skeleton sk-item" style="height:50px;"></div>`;
        document.body.innerHTML = getSkeletonStyle() + wrapInLayout(skeletonBody, sidebar);
	};
	
    const renderNoConnection = async () => { 
		if (!document.body) {
            setTimeout(renderNoConnection, 50);
            return;
        }

        let userIp = "...";
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            userIp = ipData.ip;
        } catch (e) {}

        const errorHtml = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
                    <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 22px; font-weight: 700;">SERVER DISCONNECTED</h2>
                    <p style="color: #666; font-size: 13px; margin-bottom: 25px;">Backend server tidak merespon atau akses diblokir.</p>
                    <button onclick="window.location.reload()" style="cursor: pointer; padding: 12px; background: #0088cc; color: white; border: none; border-radius: 8px; font-weight: 600;">Coba Muat Ulang</button>
                </div>
            </div>`;
        
        document.body.innerHTML = errorHtml;
	};

	const renderNotFound = () => {
        const notFoundHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5;">
                <div style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; width: 90%;">
                    <div style="font-size: 80px; font-weight: 800; color: #e8e8e8; line-height: 1; margin-bottom: 10px;">404</div>
                    <h2 style="color: #1a1a1a; margin: 0 0 10px; font-size: 22px; font-weight: 700;">Halaman Tidak Ditemukan</h2>
                    <a href="/" style="display: inline-block; cursor: pointer; padding: 12px 24px; background: #0088cc; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.3s;">Kembali ke Beranda</a>
                </div>
            </div>`;
        
        document.body.innerHTML = notFoundHtml;
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
        <article class="dynamic-content-template post type-post status-publish format-standard has-post-thumbnail hentry" style="margin-bottom: 30px; border-bottom: 1px solid #f1f1f1; padding-bottom: 20px;">
            <div class="gb-element-1ac029cb" style="display: flex; flex-direction: row; gap: 20px; align-items: center;">
                <div class="gb-element-96976bd5" style="flex: 1;">
                    <h2 class="gb-text gb-text-9cbdff50 limit_mob" style="font-size: 22px; font-weight: 700; margin: 0 0 10px 0;">
                        <a href="${getLink(news.slug, 'askme')}" style="color: #333; text-decoration: none;">${toTitleCase(news.keyword)}</a>
                    </h2>
                    <div class="gb-element-568e7728" style="display: flex; gap: 15px; font-size: 13px; color: #777;">
                        <p class="gb-text gb-text-c8e5aff6" style="margin: 0; font-weight: bold; text-transform: uppercase;">
                            <a href="#" style="color: #007cba; text-decoration: none;">UPDATE</a>
                        </p>
                        <p class="gb-text-bc7d981b" style="margin: 0; display: flex; align-items: center; gap: 5px;">
                            <span class="gb-shape"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"></path><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"></path></svg></span>
                            <span class="gb-text">${formatSimpleDate(news.created_at)}</span>
                        </p>
                    </div>
                </div>
                <div class="gb-element-edb99aad round" style="flex: 0 0 150px;">
                    <figure class="wp-block-post-featured-image" style="margin: 0;">
                        <a href="${getLink(news.slug, 'askme')}">
                            <img src="${getFirstImageUrl(news.images || news.json_images) || CONFIG.DEFAULT_IMAGE}" style="width: 150px; height: 110px; object-fit: cover; border-radius: 8px;" loading="lazy">
                        </a>
                    </figure>
                </div>
            </div>
        </article>`).join('');
		
        const sidebarHtml = `
            <div class="widget">
                <h2 class="widget-title" style="font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">Tentang Kami</h2>
                <p style="font-size: 14px; color: #555;">Dapatkan pembaruan dan tutorial teknis seputar platform blog, instalasi, web automation, dan pengoptimalan deployment.</p>
            </div>
        `;

        document.body.innerHTML = wrapInLayout(listHtml, sidebarHtml);
    };
	
    const loadDetail = async (slug, type = "news") => {
		const detailEndpoint = `/api/news/${type}/${slug}`;
		if (!memoryCache.has(detailEndpoint)) renderSkeletonDetail();
		
		const [resDetail, resRelated] = await Promise.all([
			fetchAPI(detailEndpoint),
			fetchAPI('/api/news/related').catch(() => null)
		]);
		
		if (resDetail && resDetail.status === "not_found") {
			return renderNotFound();
		}

		if (!resDetail || resDetail.status !== "success") {
			return renderNoConnection();
		}

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
                    "@type": ["Person", "Organization"],
                    "@id": `${CONFIG.DOMAIN}/#person`,
                    "name": "Admin"
                },
                {
                    "@type": "WebSite",
                    "@id": `${CONFIG.DOMAIN}/#website`,
                    "url": `${CONFIG.DOMAIN}/`,
                    "name": CONFIG.SITE_NAME,
                    "publisher": { "@id": `${CONFIG.DOMAIN}/#person` },
                    "inLanguage": "en_US"
                },
                {
                    "@type": "ImageObject",
                    "@id": detailImage,
                    "url": detailImage,
                    "inLanguage": "en_US"
                },
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
                    "@type": "Person",
                    "@id": `${CONFIG.DOMAIN}/page/contact.html`,
                    "name": "Admin",
                    "url": `${CONFIG.DOMAIN}/page/contact.html`,
                    "sameAs": [`${CONFIG.DOMAIN}/`]
                },
                {
                    "@type": "BlogPosting",
                    "headline": cleanTitle,
                    "keywords": detailKeywords,
                    "datePublished": pubDateUTC,
                    "dateModified": pubDateUTC,
                    "articleSection": type,
                    "author": { "@id": `${CONFIG.DOMAIN}/page/contact.html`, "name": "Admin" },
                    "publisher": { "@id": `${CONFIG.DOMAIN}/#person` },
                    "description": detailDescription,
                    "name": cleanTitle,
                    "@id": `${detailUrl}#richSnippet`,
                    "image": { "@id": detailImage },
                    "inLanguage": "en_US",
                    "mainEntityOfPage": { "@id": `${detailUrl}#webpage` }
                }
            ]
        };
		
		const schemaBreadcrumb = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "Home",
					"item": {
						"@type": "WebPage",
						"@id": `${CONFIG.DOMAIN}/`
					}
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": cleanTitle,
					"item": {
						"@type": "WebPage",
						"@id": detailUrl
					}
				}
			]
		};

		injectSchema(schemaGraph);
		injectSchema(schemaBreadcrumb);

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
			const imgTag = imgUrl ? `<img src="${imgUrl}" alt="${cleanTitle}" style="width:100%; max-width:100%; height:auto; border-radius:8px; margin: 20px 0;" loading="lazy">` : "";
			return `<p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px; color: #444;">${text}</p>${imgTag}`;
		}).join('');
		
        const relatedHtml = (resRelated && resRelated.data)
            ? resRelated.data.slice(0, 10).map(item => `
                <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                    <small style="color: #999; font-size: 12px; display: block; margin-bottom: 5px;">${formatSimpleDate(item.created_at)}</small>
                    <a href="${getLink(item.slug, 'askme')}" style="font-size: 14px; font-weight: 600; color: #333; text-decoration: none;">${toTitleCase(item.keyword)}</a>
                </div>`).join('')
            : '';

        const detailHtml = `
            <article class="post type-post status-publish format-standard has-post-thumbnail hentry">
                <header class="entry-header" style="margin-bottom: 25px;">
                    <h1 class="entry-title" style="font-size: 32px; font-weight: 800; line-height: 1.3; margin: 0 0 10px 0; color: #1a1a1a;">${cleanTitle}</h1>
                    <div class="entry-meta" style="color: #777; font-size: 13px;">
                        <span>Dipublikasikan pada ${pubDateSimple}</span>
                    </div>
                </header>
                <div class="entry-content">
                    ${bodyHtml}
                </div>
            </article>
        `;

        const sidebarHtml = relatedHtml ? `
            <div class="widget">
                <h2 class="widget-title" style="font-size: 18px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">Artikel Terkait</h2>
                <div>${relatedHtml}</div>
            </div>
        ` : '';

        document.body.innerHTML = wrapInLayout(detailHtml, sidebarHtml);
    };

    const renderRawXml = async (type) => {
		try {
            const urlFormat = isTldMode ? 'tld' : 'blogspot';
            const currentPage = pageParam || 1;
			const targetUrl = `${CONFIG.API_URL}/api/${type}?key=${CONFIG.API_KEY}&domain=${encodeURIComponent(CONFIG.DOMAIN)}&db=${CONFIG.DATABASE_NAME}&format=${urlFormat}&page=${currentPage}`;

			const res = await fetch(targetUrl, {
				method: 'GET',
				headers: {
					'x-api-key': CONFIG.API_KEY,
					'Accept': 'application/xml'
				}
			});

			if (!res.ok) {
				if (res.status === 403) throw new Error('Akses Ditolak (403)');
				throw new Error(`Server merespon dengan status: ${res.status}`);
			}

			const xmlText = await res.text();
			
			document.open("text/xml", "replace");
			document.write(xmlText);
			document.close();

		} catch (e) {
			console.error("XML Render Error:", e);
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
		if (typeof fillHomeAds === "function") {
			const topAds = document.getElementById('ads-728x90');
			if (topAds) { topAds.style.display = 'block'; fillHomeAds(); }
		}
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
