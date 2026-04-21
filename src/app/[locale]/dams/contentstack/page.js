"use client";
import Header from "@/components/header";
import { useParams } from "next/navigation";
import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import { ContentstackClient } from "@/lib/contentstack-client";

export default function ContentstackPage(){
    const params = useParams();
    const [entry, setEntry] = useState({});
    const [selectedDemo, setSelectedDemo] = useState('responsive');
    const [selectedImage, setSelectedImage] = useState(null);

    const getContent = async () => {
        const entries = await ContentstackClient.getElementByType(
            "contentstack_dam",
            params.locale
        );
        if (entries && entries.length > 0) {
            setEntry(entries?.[0] ?? {});
            console.log('Contentstack DAM content fetched:', entries[0]);
        }
    };

    useEffect(() => {
        getContent();
        ContentstackClient.onEntryChange(getContent);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper function to build Contentstack Image Delivery API URLs
    const buildImageUrl = (baseUrl, params = {}) => {
        if (!baseUrl) return '';
        
        // Parse the base URL
        const url = new URL(baseUrl);
        
        // Get existing query params if any
        const queryParams = new URLSearchParams(url.search);
        
        // Add new parameters (will override existing ones)
        if (params.width) queryParams.set('width', params.width.toString());
        if (params.height) queryParams.set('height', params.height.toString());
        if (params.format) queryParams.set('format', params.format);
        if (params.quality !== undefined) queryParams.set('quality', params.quality.toString());
        if (params.saturation !== undefined) queryParams.set('saturation', params.saturation.toString());
        if (params.contrast !== undefined) queryParams.set('contrast', params.contrast.toString());
        if (params.brightness !== undefined) queryParams.set('brightness', params.brightness.toString());
        if (params.resizeFilter) queryParams.set('resize-filter', params.resizeFilter);
        
        // Reconstruct URL with new query string
        const queryString = queryParams.toString();
        return `${url.origin}${url.pathname}${queryString ? '?' + queryString : ''}`;
    };

    // Get base image URLs from Contentstack entry
    const bannerUrl = entry?.banner?.banner_image?.url || 'https://images.contentstack.io/v3/assets/bltc991c0dda4197336/blt5d9c10062e0a93f7/67411c8348603bf3bb498fd9/chairs_on_beach.jpeg';
    const responsiveImageUrl = entry?.responsive_image?.url || bannerUrl;
    const optimizationImageUrl = entry?.optimization_image?.url || bannerUrl;
    const effectsImageUrl = entry?.image_effects?.url || bannerUrl;
    const resizeImageUrl = entry?.resize_image?.url || bannerUrl;
    
    const demos = {
        responsive: {
            title: 'Responsive Images',
            description: 'Serve optimized image sizes for different devices using width and height parameters. Reduce bandwidth and improve load times across mobile, tablet, and desktop.',
            images: [
                { label: 'Mobile (400px)', url: buildImageUrl(responsiveImageUrl, { width: 400 }) , $: entry?.responsive_image?.$},
                { label: 'Tablet (800px)', url: buildImageUrl(responsiveImageUrl, { width: 800 }) , $: entry?.responsive_image?.$},
                { label: 'Desktop (1200px)', url: buildImageUrl(responsiveImageUrl, { width: 1200 }) , $: entry?.responsive_image?.$},
            ]
        },
        optimization: {
            title: 'Format & Quality Optimization',
            description: 'Convert images to modern formats like WebP and adjust quality settings to optimize file size while maintaining visual quality.',
            images: [
                { label: 'Original (JPG)', url: optimizationImageUrl , $: entry?.optimization_image?.$},
                { label: 'WebP Format', url: buildImageUrl(optimizationImageUrl, { format: 'webp' }), $: entry?.optimization_image?.$ },
                { label: 'Optimized Quality', url: buildImageUrl(optimizationImageUrl, { format: 'webp', quality: 80 }) , $: entry?.optimization_image?.$ },
            ]
        },
        effects: {
            title: 'Image Effects',
            description: 'Apply real-time image effects including saturation, contrast, and brightness adjustments without storing multiple versions.',
            images: [
                { label: 'Original', url: effectsImageUrl , $: entry?.image_effects?.$},
                { label: 'Grayscale (Saturation -100)', url: buildImageUrl(effectsImageUrl, { saturation: -100 }) , $: entry?.image_effects?.$},
                { label: 'High Contrast', url: buildImageUrl(effectsImageUrl, { contrast: 50 }) , $: entry?.image_effects?.$},
                { label: 'Brightened', url: buildImageUrl(effectsImageUrl, { brightness: 30 }) , $: entry?.image_effects?.$},
            ]
        },
        resizeFilters: {
            title: 'Resize Filters',
            description: 'Choose from different resize filters (nearest, bilinear, bicubic, lanczos) to control how images are scaled, affecting sharpness and quality.',
            images: [
                { label: 'Original', url: resizeImageUrl , $: entry?.resize_image?.$},
                { label: 'Bilinear Filter', url: buildImageUrl(resizeImageUrl, { width: 800, resizeFilter: 'bilinear' }) , $: entry?.resize_image?.$},
                { label: 'Bicubic Filter', url: buildImageUrl(resizeImageUrl, { width: 800, resizeFilter: 'bicubic' }) , $: entry?.resize_image?.$},
                { label: 'Lanczos Filter', url: buildImageUrl(resizeImageUrl, { width: 800, resizeFilter: 'lanczos3' }) , $: entry?.resize_image?.$},
            ]
        }
    };

    return(
        <>
            <style dangerouslySetInnerHTML={{__html: `
                .contentstack-dam-page h1 {
                    font-family: var(--font-playfair) !important;
                    font-weight: 400 !important;
                    letter-spacing: 0.05em !important;
                    text-transform: none !important;
                }
                .contentstack-dam-page h2 {
                    font-family: var(--font-raleway) !important;
                    font-weight: 300 !important;
                    letter-spacing: 0.05em !important;
                    text-transform: none !important;
                }
                .contentstack-dam-page h3 {
                    font-family: var(--font-raleway) !important;
                    font-weight: 500 !important;
                    letter-spacing: 0.03em !important;
                    text-transform: none !important;
                }
                .contentstack-dam-page p {
                    font-family: var(--font-raleway) !important;
                    font-weight: 300 !important;
                }
                .contentstack-dam-page button,
                .contentstack-dam-page a[class*="button"] {
                    font-family: var(--font-raleway) !important;
                    font-weight: 500 !important;
                    letter-spacing: 0.02em !important;
                }
            `}} />
            <div className="contentstack-dam-page">
            <Header locale={params.locale} />

            {/* Hero Section */}
            <div 
                className="relative h-[600px] flex items-center justify-center"
                style={{
                    backgroundImage: `url(${bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
                {...entry?.banner?.$?.banner_image}
            >
                <div className="absolute inset-0 bg-black opacity-40"></div>
                <div className="relative z-10 text-center px-8" {...entry?.banner?.$?.title}>
                    {entry?.banner?.title && <h1 
                        className="text-5xl md:text-7xl text-white mb-6 font-playfair font-normal tracking-wide leading-tight"
                        style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, letterSpacing: '0.05em', lineHeight: '1.2' }}
                    >
                        {entry?.banner?.title}
                    </h1>}
                    {entry?.banner?.description && <p 
                        className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-raleway font-light tracking-wide"
                        style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300, letterSpacing: '0.02em' }}
                        {...entry?.banner?.$?.description}
                    >
                        {entry?.banner?.description}
                    </p>}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-6xl mx-auto px-8 py-24">
                <div className="text-center mb-16">
                    <h2 
                        className="text-4xl md:text-5xl text-neutral-700 mb-6 font-raleway font-light tracking-wide"
                        style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300, letterSpacing: '0.05em' }}
                    >
                        Why Use Contentstack Image Delivery API
                    </h2>
                    <p 
                        className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto font-raleway font-light leading-relaxed"
                        style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                    >
                        Built-in image transformation capabilities integrated directly with your content management workflow
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 p-8 rounded-lg flex flex-col h-full">
                        <div className="text-4xl mb-4 h-12 flex items-center">⚡</div>
                        <h3 
                            className="text-2xl text-neutral-700 mb-4 font-raleway font-medium tracking-wide h-20 flex items-start"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            Native Integration
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light text-base"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            No third-party services required. Image Delivery API is built directly into Contentstack, 
                            ensuring seamless integration with your content workflow.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-lg flex flex-col h-full">
                        <div className="text-4xl mb-4 h-12 flex items-center">📱</div>
                        <h3 
                            className="text-2xl text-neutral-700 mb-4 font-raleway font-medium tracking-wide h-20 flex items-start"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            On-the-Fly Transformations
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light text-base"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Transform images dynamically using URL parameters. Resize, convert formats, adjust quality, 
                            and apply effects without storing multiple versions.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-lg flex flex-col h-full">
                        <div className="text-4xl mb-4 h-12 flex items-center">🎨</div>
                        <h3 
                            className="text-2xl text-neutral-700 mb-4 font-raleway font-medium tracking-wide h-20 flex items-start"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            Advanced Controls
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light text-base"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Fine-tune image appearance with saturation, contrast, brightness controls, and choose from 
                            multiple resize filters for optimal quality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Demo Section */}
            <div className="bg-gray-100 py-24">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="text-center mb-12">
                        <h2 
                            className="text-4xl md:text-5xl text-neutral-700 mb-6 font-raleway font-light tracking-wide"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300, letterSpacing: '0.05em' }}
                        >
                            See It In Action
                        </h2>
                        <p 
                            className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto font-raleway font-light leading-relaxed"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Explore Contentstack&apos;s Image Delivery API capabilities with interactive demonstrations
                        </p>
                    </div>

                    {/* Demo Selector */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {Object.keys(demos).map((key) => (
                            <button
                                key={key}
                                onClick={() => setSelectedDemo(key)}
                                className={`px-6 py-3 rounded-md font-raleway font-medium tracking-wide transition-all ${
                                    selectedDemo === key
                                        ? 'bg-cyan-600 text-white shadow-lg'
                                        : 'bg-white text-neutral-700 hover:bg-gray-50'
                                }`}
                                style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500 }}
                            >
                                {demos[key].title}
                            </button>
                        ))}
                    </div>

                    {/* Demo Display */}
                    <div className="bg-white rounded-lg p-8 shadow-lg">
                        <h3 
                            className="text-2xl text-neutral-700 mb-4 font-raleway font-medium tracking-wide"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            {demos[selectedDemo].title}
                        </h3>
                        <p 
                            className="text-neutral-600 mb-8 leading-relaxed font-raleway font-light"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            {demos[selectedDemo].description}
                        </p>
                        
                        <div className="space-y-6">
                            {demos[selectedDemo].images.map((img, index) => {
                                const isOriginal = index === 0;
                                return (
                                    <div key={index} className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b">
                                            <p className="text-sm font-raleway font-medium text-neutral-700" style={{ fontFamily: 'var(--font-raleway)' }}>
                                                {img.label}
                                                {isOriginal && <span className="ml-2 text-xs text-neutral-500 font-normal">(Original)</span>}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedImage(img)}
                                            className="w-full hover:bg-gray-50 transition-colors group"
                                        >
                                            {(() => {
                                                const urlParams = new URLSearchParams(img.url.split('?')[1] || '');
                                                const width = urlParams.get('width');
                                                const maxHeight = width ? Math.min(parseInt(width) * 0.75, 400) : 300;
                                                return (
                                                    <div 
                                                        className="relative w-full bg-gray-200 flex items-center justify-center mx-auto"
                                                        style={{ 
                                                            height: `${maxHeight}px`,
                                                            maxWidth: width ? `${Math.min(parseInt(width), 800)}px` : '100%'
                                                        }}
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={img.label}
                                                            className="max-w-full max-h-full object-contain group-hover:opacity-90 transition-opacity"
                                                            style={{
                                                                width: width ? `${parseInt(width)}px` : 'auto',
                                                                height: 'auto'
                                                            }}
                                                            {...img?.$?.url}
                                                        />
                                                    </div>
                                                );
                                            })()}
                                            <div className="p-3 bg-white">
                                                <p className="text-xs text-neutral-500 text-center font-raleway font-light" style={{ fontFamily: 'var(--font-raleway)' }}>
                                                    Click to view full size
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Integration Details */}
            <div className="max-w-4xl mx-auto px-8 py-24">
                <div className="text-center mb-12">
                    <h2 
                        className="text-4xl md:text-5xl text-neutral-700 mb-6 font-raleway font-light tracking-wide"
                        style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300, letterSpacing: '0.05em' }}
                    >
                        API Capabilities
                    </h2>
                </div>

                <div className="space-y-8">
                    <div className="border-l-4 border-cyan-600 pl-6">
                        <h3 
                            className="text-2xl text-neutral-700 mb-3 font-raleway font-medium tracking-wide"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            Resize & Dimensions
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Specify width and height parameters to resize images dynamically. Perfect for responsive designs 
                            where you need different image sizes for different breakpoints.
                        </p>
                    </div>

                    <div className="border-l-4 border-blue-600 pl-6">
                        <h3 
                            className="text-2xl text-neutral-700 mb-3 font-raleway font-medium tracking-wide"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            Format Conversion
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Convert images to modern formats like WebP automatically. Combine format conversion with quality 
                            adjustments to optimize file sizes while maintaining visual quality.
                        </p>
                    </div>

                    <div className="border-l-4 border-purple-600 pl-6">
                        <h3 
                            className="text-2xl text-neutral-700 mb-3 font-raleway font-medium tracking-wide"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            Image Effects
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Adjust saturation (-100 to 100), contrast (-100 to 100), and brightness (-100 to 100) parameters 
                            to fine-tune image appearance. Use saturation of -100 for grayscale effects.
                        </p>
                    </div>

                    <div className="border-l-4 border-green-600 pl-6">
                        <h3 
                            className="text-2xl text-neutral-700 mb-3 font-raleway font-medium tracking-wide"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'none' }}
                        >
                            Resize Filters
                        </h3>
                        <p 
                            className="text-neutral-600 leading-relaxed font-raleway font-light"
                            style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                        >
                            Choose from multiple resize filters including nearest, bilinear, bicubic, and lanczos (lanczos2, lanczos3) 
                            to control how images are scaled, affecting sharpness and quality of the output.
                        </p>
                    </div>
                </div>
            </div>

            {/* Resources Section */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 py-16">
                <div className="max-w-4xl mx-auto px-8">
                    <h2 
                        className="text-4xl md:text-5xl text-white mb-6 font-raleway font-light tracking-wide text-center"
                        style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                    >
                        Documentation & Resources
                    </h2>
                    <p 
                        className="text-xl md:text-2xl text-white mb-8 leading-relaxed font-raleway font-light tracking-wide text-center"
                        style={{ fontFamily: 'var(--font-raleway)', fontWeight: 300 }}
                    >
                        Learn more about Contentstack&apos;s Image Delivery API, including all available parameters, 
                        use cases, and implementation examples.
                    </p>
                    <div className="max-w-2xl mx-auto">
                        <a
                            href="https://www.contentstack.com/docs/developers/apis/image-delivery-api"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white text-cyan-600 rounded-lg p-6 hover:bg-gray-50 transition-colors group"
                        >
                            <h3 className="text-xl font-raleway font-medium mb-3 group-hover:text-cyan-700" style={{ fontFamily: 'var(--font-raleway)' }}>
                                Image Delivery API Documentation
                            </h3>
                            <p className="text-neutral-600 font-raleway font-light leading-relaxed mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>
                                Complete reference guide covering all Image Delivery API parameters including resize, format conversion, 
                                quality settings, effects, resize filters, and canvas operations.
                            </p>
                            <div className="text-sm font-raleway font-medium text-cyan-600 group-hover:text-cyan-700" style={{ fontFamily: 'var(--font-raleway)' }}>
                                View Documentation →
                            </div>
                        </a>
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-white/90 font-raleway font-light text-sm" style={{ fontFamily: 'var(--font-raleway)' }}>
                            The Image Delivery API works seamlessly with Contentstack&apos;s Asset Management system, 
                            allowing you to transform any image stored in your stack using simple URL parameters.
                        </p>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div 
                        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h3 className="text-xl font-raleway font-medium text-neutral-700" style={{ fontFamily: 'var(--font-raleway)' }}>
                                {selectedImage.label}
                            </h3>
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="text-neutral-500 hover:text-neutral-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Extract width from URL to display actual size */}
                            {(() => {
                                const urlParams = new URLSearchParams(selectedImage.url.split('?')[1] || '');
                                const width = urlParams.get('width');
                                const height = urlParams.get('height');
                                return (
                                    <div className="mb-4">
                                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
                                            <p className="text-sm font-raleway font-medium text-cyan-800" style={{ fontFamily: 'var(--font-raleway)' }}>
                                                Image Dimensions: {width ? `${width}px` : 'Original'} {height ? `× ${height}px` : ''}
                                            </p>
                                        </div>
                                        <div 
                                            className="relative bg-gray-100 rounded-lg overflow-hidden mx-auto border-2 border-gray-300"
                                            style={{
                                                width: width ? `${Math.min(parseInt(width), 1200)}px` : '100%',
                                                maxWidth: '100%',
                                                aspectRatio: height && width ? `${width}/${height}` : 'auto'
                                            }}
                                        >
                                            <img
                                                src={selectedImage.url}
                                                alt={selectedImage.label}
                                                className="w-full h-auto"
                                                style={{ 
                                                    maxWidth: width ? `${parseInt(width)}px` : '100%',
                                                    height: 'auto',
                                                    display: 'block'
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-raleway font-medium text-neutral-700 mb-2" style={{ fontFamily: 'var(--font-raleway)' }}>
                                    Image URL:
                                </p>
                                <code className="text-xs text-neutral-600 break-all font-mono block">
                                    {selectedImage.url}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer locale={params.locale} />
            </div>
        </>
    )
}
