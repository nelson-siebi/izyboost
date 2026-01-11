<x-mail::layout>
    {{-- Header --}}
    <x-slot:header>
        <x-mail::header :url="config('app.url')">
            {{ config('app.name') }}
        </x-mail::header>
    </x-slot:header>

    {{-- Body --}}
    {!! $slot !!}

    {{-- Subcopy --}}
    @isset($subcopy)
        <x-slot:subcopy>
            <x-mail::subcopy>
                {!! $subcopy !!}
            </x-mail::subcopy>
        </x-slot:subcopy>
    @endisset

    {{-- Footer --}}
    <x-slot:footer>
        <x-slot:footer>
            <x-mail::footer>
                <div style="margin-bottom: 20px;">
                    {{-- Social and Contact --}}
                    <a href="https://facebook.com" style="margin: 0 5px; text-decoration: none;">Facebook</a> •
                    <a href="https://twitter.com" style="margin: 0 5px; text-decoration: none;">Twitter</a> •
                    <a href="https://youtube.com" style="margin: 0 5px; text-decoration: none;">YouTube</a> •
                    <a href="https://linkedin.com" style="margin: 0 5px; text-decoration: none;">LinkedIn</a>
                    <br><br>
                    © {{ date('Y') }} {{ config('app.name', 'IzyBoost') }}. @lang('All rights reserved.')
                </div>
            </x-mail::footer>
        </x-slot:footer>
    </x-slot:footer>
</x-mail::layout>