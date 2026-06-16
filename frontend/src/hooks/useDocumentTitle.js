import { useEffect } from 'react'

function useDocumentTitle(pageName) {
	useEffect(() => {
		document.title = `ArenaHUB | ${pageName}`
	}, [pageName]) // Akan otomatis update jika nama halaman berubah
}

export default useDocumentTitle
