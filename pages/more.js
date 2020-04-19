import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default () => {
	let router = useRouter()
	useEffect(() => {
		router.replace('/about')
	}, [])	
	return null
}